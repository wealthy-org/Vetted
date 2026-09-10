import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}
const sql = neon(process.env.DATABASE_URL);

await sql`delete from narratives a using narratives b where a.id < b.id and a.tag = b.tag and a.week_start = b.week_start`;
try {
  await sql`alter table narratives add constraint narratives_tag_week_unique unique (tag, week_start)`;
  console.log("Migration applied: narratives (tag, week_start) unique constraint added");
} catch (err) {
  if (err.message.includes("already exists")) {
    console.log("Constraint already exists, skipping.");
  } else {
    throw err;
  }
}
