/**
 * Migrations, applied in key order on boot. Append new ones; never edit or
 * reorder one that has shipped. They use an untyped Kysely because each one
 * sees the schema as it was at that point in history.
 */
import { sql, type Kysely } from "kysely";
import type { Migration } from "kysely/migration";

export const migrations: Record<string, Migration> = {
  "0001_notes": {
    async up(db: Kysely<unknown>) {
      await db.schema
        .createTable("notes")
        .addColumn("id", "uuid", (c) =>
          c.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("body", "text", (c) => c.notNull())
        .addColumn("created_at", "timestamptz", (c) =>
          c.notNull().defaultTo(sql`now()`),
        )
        .execute();
    },
    async down(db: Kysely<unknown>) {
      await db.schema.dropTable("notes").execute();
    },
  },
};
