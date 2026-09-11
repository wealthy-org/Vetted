import Link from "next/link";
import { sql } from "@/lib/db";
import { chainLabel } from "@/lib/chains";

export const dynamic = "force-dynamic";

async function getKol(username) {
  const rows = await sql`
    select k.id, k.x_username, k.display_name, s.win_rate, s.avg_return, s.total_calls
    from kols k
    left join kol_stats s on s.kol_id = k.id
    where k.x_username = ${username}
    limit 1
  `;
  return rows[0] ?? null;
}

async function getCallHistory(kolId) {
  return sql`
    select c.called_at, c.price_at_call, t.address, t.symbol, t.chain, t.risk_score, t.price_usd
    from calls c
    join tokens t on t.address = c.token_address
    where c.kol_id = ${kolId}
    order by c.called_at desc
  `;
}

function initials(str) {
  return str?.slice(0, 2).toUpperCase() ?? "??";
}

export default async function KolDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const kol = await getKol(params.username);

  if (!kol) {
    return (
      <div className="dp">
        <div className="dp__empty">
          <p>KOL not found.</p>
          <span>We don&apos;t have any tracked data for this account yet.</span>
        </div>
      </div>
    );
  }

  const calls = await getCallHistory(kol.id);
  const wins = calls.filter((c) => c.price_at_call && c.price_usd && Number(c.price_usd) > Number(c.price_at_call));

  return (
    <div className="dp">
      <Link href="/dashboard/leaderboard" className="td__back">
        ← Back to leaderboard
      </Link>

      <div className="td__head">
        <div className="dp__avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
          {initials(kol.x_username)}
        </div>
        <div className="td__head-text">
          <h1>@{kol.x_username}</h1>
          {kol.display_name && <span className="dp__muted">{kol.display_name}</span>}
        </div>
        <div className="td__head-score">
          <span className={`pill ${kol.win_rate >= 50 ? "pill--ok" : "pill--warn"}`} style={{ fontSize: 16, padding: "8px 16px" }}>
            {kol.win_rate != null ? `${Number(kol.win_rate).toFixed(0)}% win rate` : "No data yet"}
          </span>
        </div>
      </div>

      <div className="dp__stats">
        <div className="dp__stat">
          <span className="dp__stat-label">Total calls</span>
          <b>{kol.total_calls ?? calls.length}</b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Avg return</span>
          <b className={kol.avg_return >= 0 ? "dp__stat-good" : "dp__stat-bad"}>
            {kol.avg_return != null ? `${Number(kol.avg_return).toFixed(1)}%` : "—"}
          </b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Winning calls</span>
          <b>{wins.length}/{calls.length}</b>
        </div>
      </div>

      <h2 className="td__section-title">Call history</h2>
      {calls.length === 0 ? (
        <div className="dp__empty">
          <p>No calls recorded for this KOL yet.</p>
        </div>
      ) : (
        <div className="dp__table">
          <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "1fr 0.8fr 1fr 1fr 1fr" }}>
            <span>Token</span>
            <span>Chain</span>
            <span>Called at</span>
            <span>Risk score</span>
            <span>Return</span>
          </div>
          {calls.map((c, i) => {
            const hasPrices = c.price_at_call != null && c.price_usd != null;
            const returnPct = hasPrices
              ? ((Number(c.price_usd) - Number(c.price_at_call)) / Number(c.price_at_call)) * 100
              : null;
            return (
              <Link
                key={i}
                href={`/dashboard/token/${c.address}`}
                className="dp__row dp__row--clickable"
                style={{ gridTemplateColumns: "1fr 0.8fr 1fr 1fr 1fr" }}
              >
                <span className="dp__token">${c.symbol}</span>
                <span className="dp__muted">{chainLabel(c.chain)}</span>
                <span className="dp__muted">{new Date(c.called_at).toLocaleDateString()}</span>
                <span>
                  <span className={`pill ${c.risk_score >= 50 ? "pill--ok" : "pill--warn"}`}>
                    {c.risk_score}/100
                  </span>
                </span>
                <span className={returnPct == null ? "dp__muted" : returnPct >= 0 ? "dp__stat-good" : "dp__stat-bad"}>
                  {returnPct == null ? "—" : `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
