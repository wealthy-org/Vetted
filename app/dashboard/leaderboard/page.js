import Link from "next/link";
import { sql } from "@/lib/db";
import Pagination from "../Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

async function getLeaderboard(page) {
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await sql`
    select k.x_username, k.display_name, s.win_rate, s.avg_return, s.total_calls
    from kol_stats s
    join kols k on k.id = s.kol_id
    order by s.win_rate desc nulls last
    limit ${PAGE_SIZE} offset ${offset}
  `;

  const [{ total }] = await sql`select count(*)::int as total from kol_stats`;

  return { rows, total };
}

export default async function LeaderboardPage({ searchParams }) {
  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);
  const { rows, total } = await getLeaderboard(page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rankOffset = (page - 1) * PAGE_SIZE;

  return (
    <div className="dp">
      <div className="dp__head">
        <h1>KOL Leaderboard</h1>
        <p>Ranked by historical win rate across every call we&apos;ve tracked.</p>
      </div>

      {rows.length === 0 ? (
        <div className="dp__empty">
          <p>No stats yet.</p>
          <span>
            Win rates are computed once calls have enough price history —
            check back after the first tracked calls mature.
          </span>
        </div>
      ) : (
        <>
          <div className="dp__table">
            <div className="dp__row dp__row--head" style={{ gridTemplateColumns: "40px 1.4fr 1fr 1fr 1fr" }}>
              <span>#</span>
              <span>KOL</span>
              <span>Win rate</span>
              <span>Avg return</span>
              <span>Total calls</span>
            </div>
            {rows.map((r, i) => (
              <Link
                href={`/dashboard/kol/${r.x_username}`}
                className="dp__row dp__row--clickable"
                key={r.x_username}
                style={{ gridTemplateColumns: "40px 1.4fr 1fr 1fr 1fr" }}
              >
                <span className="dp__muted">{rankOffset + i + 1}</span>
                <span className="dp__entity">
                  <span className="dp__avatar">{r.x_username.slice(0, 2).toUpperCase()}</span>
                  <b>@{r.x_username}</b>
                </span>
                <span>
                  <span className={`pill ${r.win_rate >= 50 ? "pill--ok" : "pill--warn"}`}>
                    {r.win_rate != null ? `${Number(r.win_rate).toFixed(0)}%` : "—"}
                  </span>
                </span>
                <span className="dp__muted">
                  {r.avg_return != null ? `${Number(r.avg_return).toFixed(1)}%` : "—"}
                </span>
                <span className="dp__muted">{r.total_calls}</span>
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => (p > 1 ? `/dashboard/leaderboard?page=${p}` : "/dashboard/leaderboard")}
          />
        </>
      )}
    </div>
  );
}
