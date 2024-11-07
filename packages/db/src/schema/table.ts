import { boolean, index, text, unique, uuid } from "drizzle-orm/pg-core";

import { createTable } from "#schema/helpers/create-table.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";
import { users } from "#schema/user.ts";

export const table = createTable(
  "table",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    definition: text("definition").notNull(),
    description: text("description"),
    favorited: boolean("favorited").default(false),
    ...timestamps,
  },
  (table) => [
    index("tables_user_id_favorited_idx").on(
      table.userId,
      table.favorited.desc(),
    ),
    unique("tables_user_id_slug_unique").on(table.userId, table.slug),
  ],
);
