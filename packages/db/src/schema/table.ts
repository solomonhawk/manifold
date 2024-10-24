import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { users } from "#schema/auth.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";

export const table = pgTable("table", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  definition: text("definition").notNull(),
  ...timestamps,
});

export type TableInsert = typeof table.$inferInsert;
