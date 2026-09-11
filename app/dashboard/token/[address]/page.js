import Link from "next/link";
import { sql } from "@/lib/db";
import AddToWatchlistButton from "../../AddToWatchlistButton";
import TokenIcon from "../../TokenIcon";
import CopyButton from "../../CopyButton";
import Sparkline from "../../Sparkline";
import { explorerFor } from "@/lib/explorer";
import { chainLabel } from "@/lib/chains";

export const dynamic = "force-dynamic";

async function getToken(address) {
  const rows = await sql`
    select * from tokens where address = ${address} limit 1
  `;
  return rows[0] ?? null;
}

async function getCallHistory(address) {
  return sql`
    select c.called_at, c.price_at_call, k.x_username, k.display_name
    from calls c
    join kols k on k.id = c.kol_id
    where c.token_address = ${address}
    order by c.called_at desc
  `;
}

async function getPriceHistory(address) {
  return sql`
    select price_usd, snapshot_at
    from price_snapshots
    where token_address = ${address}
    order by snapshot_at asc
  `;
}

async function getSmartMoneyActivity(address) {
  return sql`
    select a.action, a.tx_at, w.label, w.address as wallet, w.win_rate_estimate
    from wallet_activities a
    join smart_wallets w on w.id = a.wallet_id
    where a.token_address = ${address}
    order by a.tx_at desc
  `;
}

function scoreReason(token) {
  const reasons = [];
  if (token.is_honeypot) {
    reasons.push({ ok: false, label: "Honeypot detected", detail: "This token blocks sells — do not buy." });
    return reasons;
  }

  const liq = Number(token.liquidity ?? 0);
  reasons.push({
    ok: liq >= 20000,
    label: "Liquidity",
    detail: `$${liq.toLocaleString()} — ${liq >= 20000 ? "healthy depth" : liq >= 5000 ? "thin, expect slippage" : "very low, high rug risk"}`,
  });

  const totalTax = Number(token.tax_buy ?? 0) + Number(token.tax_sell ?? 0);
  reasons.push({
    ok: totalTax <= 5,
    label: "Tax (buy + sell)",
    detail: `${Number(token.tax_buy ?? 0)}% / ${Number(token.tax_sell ?? 0)}% — ${totalTax <= 5 ? "normal range" : totalTax <= 15 ? "elevated" : "very high, likely a tax trap"}`,
  });

  const holders = token.holder_count;
  reasons.push({
    ok: holders == null ? false : holders >= 200,
    label: "Holder count",
    detail: holders == null ? "unknown" : `${holders.toLocaleString()} holders — ${holders >= 200 ? "reasonably distributed" : holders >= 50 ? "still concentrated" : "very concentrated"}`,
  });

  return reasons;
}

function shorten(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default async function TokenDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const token = await getToken(params.address);

  if (!token) {
    return (
      <div className="dp">
        <div className="dp__empty">
          <p>Token not found.</p>
          <span>We don&apos;t have any tracked data for this address yet.</span>
        </div>
      </div>
    );
  }

  const [calls, smartMoney, priceHistory] = await Promise.all([
    getCallHistory(params.address),
    getSmartMoneyActivity(params.address),
    getPriceHistory(params.address),
  ]);
  const reasons = scoreReason(token);
  const explorer = explorerFor(token.chain, token.address);

  const earliestCall = calls.length ? calls[calls.length - 1] : null;
  const priceChangePct =
    earliestCall?.price_at_call && token.price_usd
      ? ((Number(token.price_usd) - Number(earliestCall.price_at_call)) / Number(earliestCall.price_at_call)) * 100
      : null;

  return (
    <div className="dp">
      <a href="/dashboard" className="td__back">
        ← Back to feed
      </a>

      <div className="td__head">
        <div>
          <TokenIcon chain={token.chain} address={token.address} symbol={token.symbol} size={52} />
        </div>
        <div className="td__head-text">
          <h1>
            ${token.symbol} <span className="dp__muted">· {token.name}</span>
          </h1>
          <div className="td__addr-row">
            <span className="dp__chain" style={{ fontSize: 13 }}>
              {chainLabel(token.chain)}
            </span>
            <span className="dp__muted" style={{ fontSize: 13 }}>·</span>
            {explorer ? (
              <a
                href={explorer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="td__addr-link"
                title={`View on ${explorer.name}`}
              >
                {shorten(token.address)} ↗
              </a>
            ) : (
              <span className="dp__muted" style={{ fontSize: 13 }}>{shorten(token.address)}</span>
            )}
            <CopyButton value={token.address} label="Copy" />
          </div>
        </div>
        <div className="td__head-score">
          <span
            className={`pill ${token.risk_score >= 50 ? "pill--ok" : "pill--warn"}`}
            style={{ fontSize: 16, padding: "8px 16px" }}
          >
            {token.risk_score}/100
          </span>
          <AddToWatchlistButton tokenAddress={token.address} />
        </div>
      </div>

      {priceHistory.length >= 2 && (
        <div className="td__marketbar">
          <div className="td__marketbar-trend">
            <span className="td__marketbar-label">Trend since first call</span>
            <span className={priceChangePct >= 0 ? "dp__stat-good" : "dp__stat-bad"} style={{ fontWeight: 800, fontSize: 15 }}>
              {priceChangePct == null ? "—" : `${priceChangePct >= 0 ? "↑" : "↓"} ${Math.abs(priceChangePct).toFixed(1)}%`}
            </span>
          </div>
          <div className="td__marketbar-stat">
            <span className="td__marketbar-label">24h Vol</span>
            <b>{token.volume_24h != null ? `$${Number(token.volume_24h).toLocaleString()}` : "—"}</b>
          </div>
          <div className="td__marketbar-stat">
            <span className="td__marketbar-label">Liquidity</span>
            <b>${Number(token.liquidity ?? 0).toLocaleString()}</b>
          </div>
          <Sparkline
            prices={priceHistory.map((p) => Number(p.price_usd))}
            positive={priceChangePct == null ? true : priceChangePct >= 0}
          />
        </div>
      )}

      <div className="dp__stats">
        <div className="dp__stat">
          <span className="dp__stat-label">Liquidity</span>
          <b>${Number(token.liquidity ?? 0).toLocaleString()}</b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Tax buy/sell</span>
          <b>
            {Number(token.tax_buy ?? 0)}% / {Number(token.tax_sell ?? 0)}%
          </b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Holders</span>
          <b>{token.holder_count?.toLocaleString() ?? "—"}</b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Since first call</span>
          <b className={priceChangePct == null ? "" : priceChangePct >= 0 ? "dp__stat-good" : "dp__stat-bad"}>
            {priceChangePct == null ? "—" : `${priceChangePct >= 0 ? "+" : ""}${priceChangePct.toFixed(1)}%`}
          </b>
        </div>
      </div>

      <h2 className="td__section-title">Why this score</h2>
      <div className="td__reasons">
        {reasons.map((r) => (
          <div className="td__reason" key={r.label}>
            <span className={`td__reason-dot ${r.ok ? "ok" : "bad"}`} />
            <div>
              <b>{r.label}</b>
              <p>{r.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {smartMoney.length > 0 && (
        <>
          <h2 className="td__section-title">Smart money activity</h2>
          <div className="dp__table" style={{ marginBottom: 32 }}>
            <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "1fr 0.8fr 0.8fr 1fr" }}>
              <span>Wallet</span>
              <span>Win rate</span>
              <span>Action</span>
              <span>When</span>
            </div>
            {smartMoney.map((r, i) => (
              <div className="dp__row" key={i} style={{ gridTemplateColumns: "1fr 0.8fr 0.8fr 1fr" }}>
                <span>
                  {r.label ? <b>{r.label}</b> : <span className="dp__muted">{shorten(r.wallet)}</span>}
                </span>
                <span className="dp__muted">
                  {r.win_rate_estimate != null ? `${Number(r.win_rate_estimate).toFixed(0)}%` : "—"}
                </span>
                <span>
                  <span className={`pill ${r.action === "buy" ? "pill--ok" : "pill--warn"}`}>{r.action}</span>
                </span>
                <span className="dp__muted">{new Date(r.tx_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="td__section-title">Call history</h2>
      {calls.length === 0 ? (
        <div className="dp__empty">
          <p>No calls recorded for this token.</p>
        </div>
      ) : (
        <div className="dp__table">
          <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
            <span>KOL</span>
            <span>Called at</span>
            <span></span>
          </div>
          {calls.map((c, i) => (
            <div className="dp__row" key={i} style={{ gridTemplateColumns: "1fr 1fr auto" }}>
              <Link href={`/dashboard/kol/${c.x_username}`} className="dp__entity">
                <span className="dp__avatar">{c.x_username.slice(0, 2).toUpperCase()}</span>
                @{c.x_username}
              </Link>
              <span className="dp__muted">{new Date(c.called_at).toLocaleString()}</span>
              <a
                href={`https://x.com/${c.x_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="td__x-link"
                title="View on X"
              >
                View on X ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
