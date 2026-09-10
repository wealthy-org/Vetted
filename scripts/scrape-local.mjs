// Run this from your own machine (NOT deployed anywhere): it logs into a
// real X account to fetch fresh tweets, extracts contract addresses, and
// writes new calls straight into the Neon database — same effect as the
// Vercel cron in app/api/cron/scrape/route.js, just running locally
// because unauthenticated scraping only returns stale/cached tweets.
//
// Usage:
//   node scripts/scrape-local.mjs          # run once
//   node scripts/scrape-local.mjs --watch  # loop every 10 minutes
//
// Requires in .env.local:
//   TWITTER_USERNAME=your_x_username
//   TWITTER_PASSWORD=your_x_password
//   TWITTER_EMAIL=your_x_email            (optional, helps avoid verification prompts)

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { Scraper } from "@the-convocation/twitter-scraper";
import { extractContractAddress } from "../lib/extractCA.js";
import { fetchTokenData } from "../lib/dexscreener.js";
import { fetchTokenSecurity } from "../lib/goplus.js";
import { computeRiskScore } from "../lib/risk.js";
import { categorizeToken } from "../lib/categorize.js";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const sql = neon(process.env.DATABASE_URL);

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

async function runOnce(scraper) {
  const kols = await sql`select id, x_username from kols`;
  let newCalls = 0;

  for (const kol of kols) {
    try {
      const tweets = scraper.getTweets(kol.x_username, 10);
      for await (const tweet of tweets) {
        if (!tweet.id) continue;
        const tweetUrl = `https://x.com/${kol.x_username}/status/${tweet.id}`;

        const existing = await sql`select id from calls where tweet_url = ${tweetUrl} limit 1`;
        if (existing.length > 0) continue;

        const found = extractContractAddress(tweet.text ?? "");
        if (!found) continue;

        const { priceUsd } = await enrichAndUpsertToken(found.address, found.chain);

        await sql`
          insert into calls (kol_id, token_address, chain, tweet_url, tweet_text, called_at, price_at_call)
          values (${kol.id}, ${found.address}, ${found.chain}, ${tweetUrl}, ${tweet.text}, ${tweet.timeParsed?.toISOString() ?? new Date().toISOString()}, ${priceUsd})
        `;

        newCalls++;
        console.log(`  + new call: @${kol.x_username} -> ${found.address} (${found.chain})`);
      }
    } catch (err) {
      console.error(`  ! failed for @${kol.x_username}:`, err.message);
    }
  }

  console.log(`Run complete — ${newCalls} new call(s) inserted.`);
}

async function main() {
  if (!process.env.TWITTER_USERNAME || !process.env.TWITTER_PASSWORD) {
    console.error(
      "Missing TWITTER_USERNAME / TWITTER_PASSWORD in .env.local — add your X login credentials first."
    );
    process.exit(1);
  }

  const scraper = new Scraper();
  console.log("Logging into X...");
  await scraper.login(
    process.env.TWITTER_USERNAME,
    process.env.TWITTER_PASSWORD,
    process.env.TWITTER_EMAIL || undefined
  );
  console.log("Logged in.");

  const watch = process.argv.includes("--watch");

  if (!watch) {
    await runOnce(scraper);
    return;
  }

  console.log("Watching — running every 10 minutes. Ctrl+C to stop.");
  while (true) {
    console.log(`\n[${new Date().toISOString()}] Running scrape...`);
    await runOnce(scraper);
    await new Promise((r) => setTimeout(r, 10 * 60 * 1000));
  }
}

main().catch((err) => {
  console.error("scrape-local failed:", err.message);
  process.exit(1);
});
