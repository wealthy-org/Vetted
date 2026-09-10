import { sql } from "@/lib/db";
import { fetchRecentTweets } from "@/lib/rss";
import { extractContractAddress } from "@/lib/extractCA";
import { fetchTokenData } from "@/lib/dexscreener";
import { fetchTokenSecurity } from "@/lib/goplus";
import { computeRiskScore } from "@/lib/risk";
import { categorizeToken } from "@/lib/categorize";

// Without this, Next.js tries to statically prerender (i.e. actually
// execute, against the real database) this route at `next build` time.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function enrichAndUpsertToken(address, chain) {
  const [dex, security] = await Promise.allSettled([
    fetchTokenData(address),
    fetchTokenSecurity(chain, address),
  ]);

  const dexData = dex.status === "fulfilled" ? dex.value : null;
  const secData = security.status === "fulfilled" ? security.value : null;

  const name = dexData?.name ?? null;
  const symbol = dexData?.symbol ?? address.slice(0, 6);
  const liquidity = dexData?.liquidity ?? null;
  const priceUsd = dexData?.priceUsd ?? null;
  const taxBuy = secData?.taxBuy ?? 0;
  const taxSell = secData?.taxSell ?? 0;
  const isHoneypot = secData?.isHoneypot ?? false;
  const holderCount = secData?.holderCount ?? null;
  const category = categorizeToken(name, symbol);

  const riskScore = computeRiskScore({ liquidity, taxBuy, taxSell, isHoneypot, holderCount });

  await sql`
    insert into tokens (address, chain, name, symbol, liquidity, tax_buy, tax_sell, holder_count, risk_score, is_honeypot, category, price_usd)
    values (${address}, ${chain}, ${name}, ${symbol}, ${liquidity}, ${taxBuy}, ${taxSell}, ${holderCount}, ${riskScore}, ${isHoneypot}, ${category}, ${priceUsd})
    on conflict (address) do update set
      liquidity = excluded.liquidity, tax_buy = excluded.tax_buy, tax_sell = excluded.tax_sell,
      holder_count = excluded.holder_count, risk_score = excluded.risk_score,
      category = excluded.category, price_usd = coalesce(excluded.price_usd, tokens.price_usd), last_updated = now()
  `;

  return { priceUsd };
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const kols = await sql`select id, x_username from kols`;
  const results = [];

  for (const kol of kols) {
    try {
      const tweets = await fetchRecentTweets(kol.x_username, 5);

      for (const tweet of tweets) {
        if (!tweet.link) continue;

        const existing = await sql`
          select id from calls where tweet_url = ${tweet.link} limit 1
        `;
        if (existing.length > 0) continue;

        const text = `${tweet.title ?? ""} ${tweet.description ?? ""}`;
        const found = extractContractAddress(text);
        if (!found) continue;

        const { priceUsd } = await enrichAndUpsertToken(found.address, found.chain);

        await sql`
          insert into calls (kol_id, token_address, chain, tweet_url, tweet_text, called_at, price_at_call)
          values (${kol.id}, ${found.address}, ${found.chain}, ${tweet.link}, ${text.trim()}, ${tweet.pubDate ? new Date(tweet.pubDate).toISOString() : new Date().toISOString()}, ${priceUsd})
        `;

        results.push({ kol: kol.x_username, token: found.address, chain: found.chain });
      }
    } catch (err) {
      results.push({ kol: kol.x_username, error: err.message });
    }
  }

  return Response.json({ ranAt: new Date().toISOString(), results });
}
