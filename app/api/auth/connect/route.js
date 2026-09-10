import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { wallet } = await request.json();
  if (!wallet) {
    return Response.json({ error: "wallet is required" }, { status: 400 });
  }

  const rows = await sql`
    insert into users (wallet_address)
    values (${wallet})
    on conflict (wallet_address) do update set wallet_address = excluded.wallet_address
    returning id, wallet_address
  `;

  return Response.json({ id: rows[0].id, wallet: rows[0].wallet_address });
}
