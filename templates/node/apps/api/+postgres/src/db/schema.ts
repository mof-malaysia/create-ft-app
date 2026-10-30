/**
 * Table types for Kysely. Keep them in step with migrations.ts: a migration
 * changes the database, this file tells TypeScript about it.
 */
import type { Generated } from "kysely";

export interface Database {
  notes: NotesTable;
}

/** An example table, created by 0001_notes; replace it with your own. */
export interface NotesTable {
  id: Generated<string>;
  body: string;
  created_at: Generated<Date>;
}
