import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const rows = await sql`
    select w.id as watchlist_id, w.added_at, t.address, t.symbol, t.chain, t.risk_score, t.liquidity
    from watchlist w
    join tokens t on t.address = w.token_address
    where w.user_id = ${userId}
    order by w.added_at desc
  `;

  return Response.json({ items: rows });
}

export async function POST(request) {
  const { userId, tokenAddress } = await request.json();
  if (!userId || !tokenAddress) {
    return Response.json({ error: "userId and tokenAddress are required" }, { status: 400 });
  }

  await sql`
    insert into watchlist (user_id, token_address)
    values (${userId}, ${tokenAddress})
    on conflict (user_id, token_address) do nothing
  `;

  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const { userId, tokenAddress } = await request.json();
  if (!userId || !tokenAddress) {
    return Response.json({ error: "userId and tokenAddress are required" }, { status: 400 });
  }

  await sql`
    delete from watchlist where user_id = ${userId} and token_address = ${tokenAddress}
  `;

  return Response.json({ ok: true });
}
