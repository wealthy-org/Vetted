import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { address } = params;

  const rows = await sql`
    select address, chain, symbol, risk_score, liquidity, tax_buy, tax_sell, is_honeypot, holder_count, last_updated
    from tokens
    where address = ${address}
    limit 1
  `;

  if (rows.length === 0) {
    return Response.json({ error: "token not tracked" }, { status: 404 });
  }

  const t = rows[0];
  return Response.json({
    address: t.address,
    chain: t.chain,
    symbol: t.symbol,
    riskScore: t.risk_score,
    liquidity: Number(t.liquidity),
    taxBuy: Number(t.tax_buy),
    taxSell: Number(t.tax_sell),
    honeypot: t.is_honeypot,
    holderCount: t.holder_count,
    lastUpdated: t.last_updated,
  });
}
