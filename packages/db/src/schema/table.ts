import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { users } from "#schema/auth.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";

export const table = pgTable(
  "table",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    definition: text("definition").notNull(),
    favorited: boolean("favorited").default(false),
    ...timestamps,
  },
  (table) => [
    index("tables_user_id_favorited_idx").on(
      table.userId,
      table.favorited.desc(),
    ),
  ],
);
