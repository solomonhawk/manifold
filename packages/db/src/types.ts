import type { table } from "#schema/table.ts";

export type TableModel = typeof table.$inferSelect;
export type TableInsert = typeof table.$inferInsert;

