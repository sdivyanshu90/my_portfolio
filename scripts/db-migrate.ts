/**
 * Apply db/schema.sql to the Neon database (idempotent — safe to re-run).
 *   npm run db:migrate
 */
import { readFileSync } from "node:fs";
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.DATABASE_URL ?? process.env.NeonDB_URI;
if (!url) {
  console.error("No DATABASE_URL / NeonDB_URI set.");
  process.exit(1);
}
const sql = neon(url);
const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n")
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) await sql.query(stmt);
const tables = await sql.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'div1_%' ORDER BY 1",
);
console.log(`applied ${statements.length} statements; tables: ${tables.map((t) => t.table_name).join(", ")}`);
