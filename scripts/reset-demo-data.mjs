// Wipes all seed-generated rows (keeps table structure) so scripts/seed.mjs
// can repopulate cleanly with fresh data — useful whenever seed token
// addresses change and old fake rows would otherwise stick around.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}
const sql = neon(process.env.DATABASE_URL);

await sql`delete from watchlist`;
await sql`delete from wallet_activities`;
await sql`delete from calls`;
await sql`delete from narratives`;
await sql`delete from kol_stats`;
await sql`delete from smart_wallets`;
await sql`delete from tokens`;
await sql`delete from kols`;

console.log("Demo data cleared. Run `node scripts/seed.mjs` next.");
