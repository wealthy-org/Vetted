import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { refreshTokenPrices } from "../lib/refreshPrices.js";
import { computeAllStats } from "../lib/computeStats.js";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Refreshing token prices from Dexscreener...");
  const priceResult = await refreshTokenPrices(sql);
  console.log(priceResult);

  console.log("Recomputing KOL and wallet win-rates...");
  const statsResult = await computeAllStats(sql);
  console.log(statsResult);

  console.log("Done.");
}

main().catch((err) => {
  console.error("compute-stats failed:", err.message);
  process.exit(1);
});
