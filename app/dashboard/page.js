import Link from "next/link";
import { sql } from "@/lib/db";
import AddToWatchlistButton from "./AddToWatchlistButton";
import TokenIcon from "./TokenIcon";
import Pagination from "./Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatUsd(n) {
  if (n == null) return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Number(n).toFixed(0)}`;
}

function initials(str) {
  return str?.slice(0, 2).toUpperCase() ?? "??";
}

function filterHref(current, patch) {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value == null) params.delete(key);
    else params.set(key, value);
  }
  // any filter change resets pagination back to page 1
  if (!("page" in patch)) params.delete("page");
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

function buildWhere(chain, minScore) {
  const conditions = [];
  const params = [];

  if (chain === "solana") {
    params.push("solana");
    conditions.push(`t.chain = $${params.length}`);
  } else if (chain === "evm") {
    params.push("solana");
    conditions.push(`t.chain != $${params.length}`);
  }
  if (minScore) {
    conditions.push(`t.risk_score >= 50`);
  }

  return {
    where: conditions.length ? `where ${conditions.join(" and ")}` : "",
    params,
  };
}

async function getCalls(chain, minScore, page) {
  const { where, params } = buildWhere(chain, minScore);
  const offset = (page - 1) * PAGE_SIZE;

  const rowsResult = await sql.query(
    `select
       c.called_at, k.x_username as kol, t.address as token_address, t.chain,
       t.symbol as token, t.risk_score as score, t.liquidity, t.tax_buy, t.tax_sell
     from calls c
     join kols k on k.id = c.kol_id
     join tokens t on t.address = c.token_address
     ${where}
     order by c.called_at desc
     limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, PAGE_SIZE, offset]
  );

  const statsResult = await sql.query(
    `select
       count(*)::int as total,
       coalesce(avg(t.risk_score), 0) as avg_score,
       count(*) filter (where t.risk_score >= 50)::int as safe_count
     from calls c
     join tokens t on t.address = c.token_address
     ${where}`,
    params
  );

  return { rows: rowsResult, stats: statsResult[0] };
}

export default async function DashboardPage({ searchParams }) {
  const chain = searchParams?.chain; // "solana" | "evm" | undefined
  const minScore = searchParams?.minScore === "50";
  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);

  const { rows: calls, stats } = await getCalls(chain, minScore, page);

  const total = stats.total;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const avgScore = Math.round(Number(stats.avg_score));
  const safePct = total ? Math.round((stats.safe_count / total) * 100) : 0;

  const current = { chain, minScore: minScore ? "50" : undefined };
  const makePageHref = (p) => filterHref(current, { page: p > 1 ? String(p) : null });

  return (
    <div className="dp">
      <div className="dp__head">
        <h1>Live feed</h1>
        <p>Every KOL call, auto-validated the moment it&apos;s detected.</p>
      </div>

      <div className="dp__stats">
        <div className="dp__stat">
          <span className="dp__stat-label">Calls tracked</span>
          <b>{total}</b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Avg risk score</span>
          <b className={avgScore >= 50 ? "dp__stat-good" : "dp__stat-bad"}>
            {avgScore}/100
          </b>
        </div>
        <div className="dp__stat">
          <span className="dp__stat-label">Flagged safe</span>
          <b>{safePct}%</b>
        </div>
      </div>

      <div className="dp__filters">
        <Link
          href={filterHref(current, { chain: null })}
          className={`dp__filter ${!chain ? "active" : ""}`}
        >
          All chains
        </Link>
        <Link
          href={filterHref(current, { chain: "solana" })}
          className={`dp__filter ${chain === "solana" ? "active" : ""}`}
        >
          Solana
        </Link>
        <Link
          href={filterHref(current, { chain: "evm" })}
          className={`dp__filter ${chain === "evm" ? "active" : ""}`}
        >
          EVM
        </Link>
        <Link
          href={filterHref(current, { minScore: minScore ? null : "50" })}
          className={`dp__filter ${minScore ? "active" : ""}`}
        >
          Min score 50+
        </Link>
      </div>

      {total === 0 ? (
        <div className="dp__empty">
          <p>{!chain && !minScore ? "No calls tracked yet." : "No calls match this filter."}</p>
          <span>
            {!chain && !minScore ? (
              <>
                The database is connected and ready — once the KOL scraper
                starts writing to the <code>calls</code> table, they&apos;ll
                show up here automatically.
              </>
            ) : (
              <>Try clearing a filter above to see more results.</>
            )}
          </span>
        </div>
      ) : (
        <>
          <div className="dp__table">
            <div className="dp__row dp__row--head">
              <span>KOL</span>
              <span>Token</span>
              <span>Called</span>
              <span>Risk score</span>
              <span>Liquidity</span>
              <span>Tax buy/sell</span>
              <span></span>
            </div>
            {calls.map((c, i) => (
              <div className="dp__row dp__row--clickable" key={i}>
                <Link
                  href={`/dashboard/token/${c.token_address}`}
                  style={{ display: "contents" }}
                >
                  <span className="dp__entity">
                    <span className="dp__avatar">{initials(c.kol)}</span>
                    @{c.kol}
                  </span>
                  <span className="dp__entity">
                    <TokenIcon chain={c.chain} address={c.token_address} symbol={c.token} />
                    <span>
                      <span className="dp__token">${c.token}</span>
                      <span className="dp__chain">{c.chain}</span>
                    </span>
                  </span>
                  <span className="dp__muted">{timeAgo(c.called_at)}</span>
                  <span>
                    <span
                      className={`pill ${c.score >= 50 ? "pill--ok" : "pill--warn"}`}
                    >
                      {c.score}/100
                    </span>
                  </span>
                  <span>{formatUsd(c.liquidity)}</span>
                  <span className="dp__muted">
                    {c.tax_buy ?? 0}% / {c.tax_sell ?? 0}%
                  </span>
                </Link>
                <span>
                  <AddToWatchlistButton tokenAddress={c.token_address} />
                </span>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} makeHref={makePageHref} />
        </>
      )}
    </div>
  );
}
