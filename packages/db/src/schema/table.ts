import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { createTable } from "#schema/helpers/create-table.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";
import { users } from "#schema/user.ts";

export const tables = createTable(
  "table",
  {
    id: uuid("id").defaultRandom().notNull().unique(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    definition: text("definition").notNull(),
    description: text("description"),
    favorited: boolean("favorited").default(false),
    availableTables: text("available_tables")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.ownerId, table.slug] }),
    index("tables_owner_id_favorited_idx").on(
      table.ownerId,
      table.favorited.desc(),
    ),
  ],
);

export const tableRelations = relations(tables, ({ one, many }) => ({
  owner: one(users, {
    fields: [tables.ownerId],
    references: [users.id],
    relationName: "tables",
  }),
  versions: many(tableVersions, {
    relationName: "versions",
  }),
}));

/**
 * Versioned tables are assumed to be published and immutable.
 *
 * @TODO: Better plan for cascading deletes. Set to NullOwner/NullTable?
 */
export const tableVersions = createTable(
  "table_version",
  {
    id: uuid("id").defaultRandom().notNull().unique(),
    ownerId: uuid("owner_id").notNull(),
    tableSlug: text("table_slug").notNull(),
    version: integer("version").notNull(),
    title: text("title").notNull(),
    definition: text("definition").notNull(),
    description: text("description"),
    availableTables: text("available_tables")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    ...timestamps,
  },
  (tableVersions) => [
    primaryKey({
      columns: [
        tableVersions.ownerId,
        tableVersions.tableSlug,
        tableVersions.version,
      ],
    }),
    foreignKey({
      columns: [tableVersions.ownerId, tableVersions.tableSlug],
      foreignColumns: [tables.ownerId, tables.slug],
    }),
  ],
);

export const tableVersionsRelations = relations(tableVersions, ({ one }) => ({
  table: one(tables, {
    fields: [tableVersions.ownerId, tableVersions.tableSlug],
    references: [tables.ownerId, tables.slug],
    relationName: "versions",
  }),
}));
