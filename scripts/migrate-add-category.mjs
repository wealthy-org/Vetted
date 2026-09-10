import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}
const sql = neon(process.env.DATABASE_URL);
await sql`alter table tokens add column if not exists category text`;
console.log("Migration applied: tokens.category added");
