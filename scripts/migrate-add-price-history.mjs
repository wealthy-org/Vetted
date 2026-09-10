import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}
const sql = neon(process.env.DATABASE_URL);

await sql`alter table tokens add column if not exists volume_24h numeric`;

await sql`
  create table if not exists price_snapshots (
    id uuid primary key default gen_random_uuid(),
    token_address text references tokens(address) on delete cascade,
    price_usd numeric,
    volume_24h numeric,
    liquidity numeric,
    snapshot_at timestamptz not null default now()
  )
`;

await sql`create index if not exists idx_price_snapshots_token_time on price_snapshots(token_address, snapshot_at)`;

console.log("Migration applied: tokens.volume_24h + price_snapshots table added");
