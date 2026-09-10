import { fetchTokenData } from "./dexscreener.js";

// Best-effort: pulls the latest USD price/volume for every tracked token
// from Dexscreener, writes it to tokens.price_usd/volume_24h, and appends a
// row to price_snapshots so a real price history accumulates over time
// (this is what the token detail page's sparkline reads from). Tokens
// Dexscreener has never indexed (e.g. demo/seed addresses that aren't real
// on-chain tokens) are simply skipped — their last known values are left
// as-is and no snapshot is recorded for that run.
export async function refreshTokenPrices(sql) {
  const tokens = await sql`select address, liquidity from tokens`;
  let updated = 0;

  for (const t of tokens) {
    try {
      const data = await fetchTokenData(t.address);
      if (data?.priceUsd != null) {
        await sql`
          update tokens
          set price_usd = ${data.priceUsd}, volume_24h = ${data.volume24h ?? null},
              liquidity = coalesce(${data.liquidity ?? null}, liquidity), last_updated = now()
          where address = ${t.address}
        `;
        await sql`
          insert into price_snapshots (token_address, price_usd, volume_24h, liquidity)
          values (${t.address}, ${data.priceUsd}, ${data.volume24h ?? null}, ${data.liquidity ?? t.liquidity})
        `;
        updated++;
      }
    } catch {
      // network hiccup on one token shouldn't stop the rest
    }
  }

  return { tokensChecked: tokens.length, pricesUpdated: updated };
}
