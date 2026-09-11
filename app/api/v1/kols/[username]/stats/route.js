import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { username } = await params;

  const rows = await sql`
    select k.x_username, k.display_name, s.win_rate, s.avg_return, s.total_calls, s.updated_at
    from kols k
    left join kol_stats s on s.kol_id = k.id
    where k.x_username = ${username}
    limit 1
  `;

  if (rows.length === 0) {
    return Response.json({ error: "kol not tracked" }, { status: 404 });
  }

  const k = rows[0];
  const calls = await sql`
    select t.address as token_address, t.symbol, c.called_at
    from calls c
    join kols kk on kk.id = c.kol_id
    join tokens t on t.address = c.token_address
    where kk.x_username = ${username}
    order by c.called_at desc
    limit 50
  `;

  return Response.json({
    username: k.x_username,
    displayName: k.display_name,
    winRate: k.win_rate != null ? Number(k.win_rate) : null,
    avgReturn: k.avg_return != null ? Number(k.avg_return) : null,
    totalCalls: k.total_calls ?? 0,
    updatedAt: k.updated_at,
    recentCalls: calls.map((c) => ({
      tokenAddress: c.token_address,
      symbol: c.symbol,
      calledAt: c.called_at,
    })),
  });
}
