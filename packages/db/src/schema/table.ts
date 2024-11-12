import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  primaryKey,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { createTable } from "#schema/helpers/create-table.ts";
import { timestamps } from "#schema/helpers/timestamps.ts";
import { userProfiles, users } from "#schema/user.ts";

export const tables = createTable(
  "table",
  {
    id: uuid("id").defaultRandom().notNull().unique(),
    tableIdentifier: text("table_identifier").notNull().unique(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ownerUsername: text("owner_username")
      .notNull()
      .references(() => userProfiles.username, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    definition: text("definition").notNull(),
    description: text("description"),
    favorited: boolean("favorited").default(false),
    availableTables: text("available_tables")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    // @TODO: should I have `dependencies` here? (i.e. top-level deps? how to store version + slug? join table?)
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.ownerUsername, table.slug] }),
    index("tables_owner_id_favorited_idx").on(
      table.ownerId,
      table.favorited.desc(),
    ),
    index("tables_table_indentifier_idx").on(table.tableIdentifier),
  ],
);

export const tableRelations = relations(tables, ({ one, many }) => ({
  owner: one(users, {
    fields: [tables.ownerId],
    references: [users.id],
    relationName: "tables",
  }),
  ownerProfile: one(userProfiles, {
    fields: [tables.ownerUsername],
    references: [userProfiles.username],
    relationName: "profileTables",
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
    tableIdentifier: text("table_identifier").notNull(),
    ownerId: uuid("owner_id").notNull(),
    ownerUsername: text("owner_username").notNull(),
    tableSlug: text("table_slug").notNull(),
    version: integer("version").notNull(),
    title: text("title").notNull(),
    definition: text("definition").notNull(),
    releaseNotes: text("release_notes"),
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
        tableVersions.ownerUsername,
        tableVersions.tableSlug,
        tableVersions.version,
      ],
    }),
    foreignKey({
      columns: [tableVersions.ownerUsername, tableVersions.tableSlug],
      foreignColumns: [tables.ownerUsername, tables.slug],
    }),
    unique("table_versions_table_identifier_version_unique").on(
      tableVersions.tableIdentifier,
      tableVersions.version,
    ),
  ],
);

export const tableVersionsRelations = relations(tableVersions, ({ one }) => ({
  table: one(tables, {
    fields: [tableVersions.ownerUsername, tableVersions.tableSlug],
    references: [tables.ownerUsername, tables.slug],
    relationName: "versions",
  }),
}));
