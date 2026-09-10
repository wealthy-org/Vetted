import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set — lib/db.js will throw once a query is run. Add it to .env.local."
  );
}

export const sql = neon(process.env.DATABASE_URL);
