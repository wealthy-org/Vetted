import { sql } from "@/lib/db";
import NarrativeGrid from "./NarrativeGrid";

export const dynamic = "force-dynamic";

async function getNarratives() {
  const narratives = await sql`
    select tag, token_count, total_volume, week_start
    from narratives
    order by week_start desc, token_count desc
    limit 20
  `;

  const tags = narratives.map((n) => n.tag);
  const tokens = tags.length
    ? await sql`
        select address, symbol, chain, category, risk_score, liquidity
        from tokens
        where category = any(${tags})
      `
    : [];

  return narratives.map((n) => ({
    ...n,
    tokens: tokens.filter((t) => t.category === n.tag),
  }));
}

export default async function NarrativesPage() {
  const rows = await getNarratives();

  return (
    <div className="dp">
      <div className="dp__head">
        <h1>Narrative Tracker</h1>
        <p>Which metas are heating up, aggregated from every token we&apos;ve scored.</p>
      </div>

      {rows.length === 0 ? (
        <div className="dp__empty">
          <p>No narrative data yet.</p>
          <span>
            This builds up automatically once enough tokens have been
            tracked and tagged across a full week.
          </span>
        </div>
      ) : (
        <NarrativeGrid rows={rows} />
      )}
    </div>
  );
}
