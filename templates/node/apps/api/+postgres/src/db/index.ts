import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import pg from "pg";
import { migrations } from "./migrations.js";
import type { Database } from "./schema.js";

export type Db = Kysely<Database>;

export function createDb(connectionString: string): Db {
  const pool = new pg.Pool({ connectionString });
  // When Postgres restarts or drops a connection, pg emits the idle client's
  // error on the pool, and an unhandled 'error' event would crash the api. The
  // pool has already discarded that client: the next query reconnects, and
  // /healthz answers 503 until it can.
  pool.on("error", (error) => {
    console.warn(`postgres: idle connection lost: ${error.message}`);
  });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}

/** Brings the database up to the newest migration; runs on every boot. */
export async function migrate(db: Db) {
  const migrator = new Migrator({
    db,
    provider: { getMigrations: async () => migrations },
  });
  const { error, results } = await migrator.migrateToLatest();
  if (error) throw error;
  return results ?? [];
}
