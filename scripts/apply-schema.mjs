import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf-8");

async function main() {
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`Schema applied successfully (${statements.length} statements).`);
  const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
  console.log("Tables now in DB:", tables.map((t) => t.table_name).join(", "));
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
