/**
 * Apply the schema (src/lib/schema.ts) to the Neon database — idempotent,
 * safe to re-run. /admin can do the same from the browser.
 *   npm run db:migrate
 */
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { schemaStatements } from "@/lib/schema";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NeonDB_URI ?? process.env.DATABASE_URL;
if (!url) {
  console.error("No NeonDB_URI / DATABASE_URL set.");
  process.exit(1);
}
const sql = neon(url);
const statements = schemaStatements();
for (const stmt of statements) await sql.query(stmt);
const tables = await sql.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'div1_%' ORDER BY 1",
);
console.log(`applied ${statements.length} statements; tables: ${tables.map((t) => t.table_name).join(", ")}`);
