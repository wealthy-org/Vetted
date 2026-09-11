import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/getSessionUser";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const rows = await sql`
    select w.id as watchlist_id, w.added_at, t.address, t.symbol, t.chain, t.risk_score, t.liquidity
    from watchlist w
    join tokens t on t.address = w.token_address
    where w.user_id = ${user.userId}
    order by w.added_at desc
  `;

  return Response.json({ items: rows });
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { tokenAddress } = await request.json();
  if (!tokenAddress) {
    return Response.json({ error: "tokenAddress is required" }, { status: 400 });
  }

  await sql`
    insert into watchlist (user_id, token_address)
    values (${user.userId}, ${tokenAddress})
    on conflict (user_id, token_address) do nothing
  `;

  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { tokenAddress } = await request.json();
  if (!tokenAddress) {
    return Response.json({ error: "tokenAddress is required" }, { status: 400 });
  }

  await sql`
    delete from watchlist where user_id = ${user.userId} and token_address = ${tokenAddress}
  `;

  return Response.json({ ok: true });
}
