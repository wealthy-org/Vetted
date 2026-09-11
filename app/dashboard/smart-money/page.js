import { sql } from "@/lib/db";
import TokenIcon from "../TokenIcon";
import Pagination from "../Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

async function getActivities(page) {
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await sql`
    select
      a.action, a.amount, a.tx_at,
      w.address as wallet, w.label, w.win_rate_estimate,
      t.address as token_address, t.symbol as token, t.chain, t.risk_score,
      (
        select array_agg(distinct k.x_username)
        from calls c join kols k on k.id = c.kol_id
        where c.token_address = a.token_address
      ) as called_by
    from wallet_activities a
    join smart_wallets w on w.id = a.wallet_id
    join tokens t on t.address = a.token_address
    order by a.tx_at desc
    limit ${PAGE_SIZE} offset ${offset}
  `;

  const [stats] = await sql`
    select
      count(distinct wallet_id)::int as wallets,
      count(*) filter (where action = 'buy')::int as buys,
      count(*) filter (
        where action = 'buy'
        and exists (select 1 from calls c where c.token_address = wallet_activities.token_address)
      )::int as confirmed,
      count(*)::int as total
    from wallet_activities
  `;

  return { rows, stats };
}

function shorten(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function BoltIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

export default async function SmartMoneyPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page, 10) || 1);
  const { rows, stats } = await getActivities(page);
  const totalPages = Math.max(1, Math.ceil(stats.total / PAGE_SIZE));

  return (
    <div className="dp">
      <div className="dp__head">
        <h1>Smart Money Watch</h1>
        <p>
          &quot;Whale&quot; = a wallet with a proven track record of profitable trades.
          When one buys a token that a KOL also called, that&apos;s two independent
          signals agreeing — the strongest kind of confirmation we can surface.
        </p>
      </div>

      <div className="dp__stats">
        <div className="dp__stat">
          <span className="dp__stat-label">Wallets tracked</span>
          <b>{stats.wallets}</b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Buys logged</span>
          <b>{stats.buys}</b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Confirmed signals</span>
          <b className="dp__stat-good">{stats.confirmed}</b>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="dp__empty">
          <p>No wallet activity tracked yet.</p>
          <span>
            Once smart wallets are added and monitored, their buys/sells will
            show up here in real time.
          </span>
        </div>
      ) : (
        <>
          <div className="dp__table">
            <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "1.1fr 0.7fr 0.7fr 1.1fr 1fr 1.3fr" }}>
              <span>Wallet</span>
              <span>Win rate</span>
              <span>Action</span>
              <span>Token</span>
              <span>When</span>
              <span>Signal</span>
            </div>
            {rows.map((r, i) => {
              const isConfirmed = r.action === "buy" && r.called_by?.length > 0;
              return (
                <div
                  className="dp__row"
                  key={i}
                  style={{ gridTemplateColumns: "1.1fr 0.7fr 0.7fr 1.1fr 1fr 1.3fr" }}
                >
                  <span>
                    {r.label ? <b>{r.label}</b> : <span className="dp__muted">{shorten(r.wallet)}</span>}
                  </span>
                  <span className="dp__muted">
                    {r.win_rate_estimate != null ? `${Number(r.win_rate_estimate).toFixed(0)}%` : "—"}
                  </span>
                  <span>
                    <span className={`pill ${r.action === "buy" ? "pill--ok" : "pill--warn"}`}>
                      {r.action}
                    </span>
                  </span>
                  <span className="dp__entity">
                    <TokenIcon chain={r.chain} address={r.token_address} symbol={r.token} size={22} />
                    <span className="dp__token">${r.token}</span>
                  </span>
                  <span className="dp__muted">{new Date(r.tx_at).toLocaleString()}</span>
                  <span>
                    {isConfirmed ? (
                      <span className="sm-signal">
                        <BoltIcon size={11} />
                        {r.called_by.slice(0, 2).map((u) => `@${u}`).join(", ")}
                        {r.called_by.length > 2 ? ` +${r.called_by.length - 2}` : ""}
                      </span>
                    ) : (
                      <span className="dp__muted" style={{ fontSize: 12.5 }}>
                        wallet only
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => (p > 1 ? `/dashboard/smart-money?page=${p}` : "/dashboard/smart-money")}
          />
        </>
      )}
    </div>
  );
}
