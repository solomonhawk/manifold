import { slugify } from "@manifold/lib/utils/string";
import {
  type TableCreateInput,
  type TableDeleteInput,
  type TableGetInput,
  type TableListInput,
  type TableListOrderBy,
  type TablePublishVersionInput,
  type TableRestoreInput,
  type TableUpdateInput,
} from "@manifold/validators";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  isNull,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "#db.ts";
import * as schema from "#schema/index.ts";

const RECENT_VERSION_COUNT = 3;

// @XXX: Is this really better than an IIFE with a `switch` statement? 🤔
const tableOrderByMap = {
  recently_edited: desc(schema.tables.updatedAt),
  recently_not_edited: asc(schema.tables.updatedAt),
  oldest: asc(schema.tables.createdAt),
  newest: desc(schema.tables.createdAt),
} as const satisfies Record<TableListOrderBy, SQL>;

export async function listTables(userId: string, input: TableListInput) {
  return db.query.tables
    .findMany({
      where: and(
        eq(schema.tables.ownerId, userId),
        input.includeDeleted ? undefined : isNull(schema.tables.deletedAt),
      ),
      orderBy: tableOrderByMap[input.orderBy ?? "newest"],
    })
    .execute();
}

export async function createTable(userId: string, input: TableCreateInput) {
  const [table] = await db
    .insert(schema.tables)
    .values({
      ...input,
      ownerId: userId,
      slug: input.slug ?? slugify(input.title),
    })
    .returning()
    .execute();

  return table;
}

export async function findTable(userId: string, input: TableGetInput) {
  const tableVersionsSubQuery = db
    .select({
      // @TODO: Drizzle doesn't correctly map/alias the subquery columns so they
      // end up as the snake_case (db) keys in the final result. Is this a bug?
      // ...getTableColumns(schema.tableVersions),
      id: sql`${schema.tableVersions.id}`.mapWith(String).as("id"),
      version: sql`${schema.tableVersions.version}`
        .mapWith(Number)
        .as("version"),
      tableSlug: sql`${schema.tableVersions.tableSlug}`.as("tableSlug"),
      definition: sql`${schema.tableVersions.definition}`.as("definition"),
      ownerId: sql`${schema.tableVersions.ownerId}`.as("ownerId"),
      createdAt: sql`${schema.tableVersions.createdAt}`.as("createdAt"),
      count: sql`count(*) over()`.mapWith(Number).as("count"),
    })
    .from(schema.tableVersions)
    .where(eq(schema.tableVersions.tableSlug, input.slug))
    .groupBy(
      schema.tableVersions.ownerId,
      schema.tableVersions.version,
      schema.tableVersions.tableSlug,
    )
    .orderBy(desc(schema.tableVersions.version))
    .limit(RECENT_VERSION_COUNT)
    .as("tableVersions");

  const [table] = await db
    .select({
      ...getTableColumns(schema.tables),
      // @NOTE: `jsonb_agg` appears to nuke the Drizzle mapped types (e.g.
      // `createdAt` gets serialized to a string instead of the mapped Date type
      // for that column). I'd like to just use the `TableVersionModel` type here...
      recentVersions: sql<
        {
          id: string;
          version: number;
          tableSlug: string;
          ownerId: string;
          createdAt: string;
          definition: string;
        }[]
      >`COALESCE(jsonb_agg("tableVersions") FILTER (WHERE "tableVersions"."id" IS NOT NULL), '[]'::jsonb)`.as(
        "recentVersions",
      ),
      totalVersionCount: tableVersionsSubQuery.count,
    })
    .from(schema.tables)
    .leftJoin(schema.users, eq(schema.users.id, schema.tables.ownerId))
    .leftJoin(
      schema.userProfiles,
      eq(schema.users.id, schema.userProfiles.userId),
    )
    .leftJoin(
      tableVersionsSubQuery,
      and(eq(schema.tables.slug, tableVersionsSubQuery.tableSlug)),
    )
    .where(
      and(
        eq(schema.userProfiles.username, input.username),
        eq(schema.tables.slug, input.slug),
        eq(schema.tables.ownerId, userId), // @TODO: remove this for public tables so anyone can view them?
      ),
    )
    .groupBy(
      schema.tables.ownerId,
      schema.tables.slug,
      tableVersionsSubQuery.count,
    );

  return table;
}

export async function updateTable(userId: string, input: TableUpdateInput) {
  const [table] = await db
    .update(schema.tables)
    .set(input)
    .where(
      and(eq(schema.tables.ownerId, userId), eq(schema.tables.id, input.id)),
    )
    .returning()
    .execute();

  return table;
}

export async function publishVersion(
  userId: string,
  username: string,
  input: TablePublishVersionInput,
) {
  const table = await findTable(userId, { slug: input.tableSlug, username });

  const [{ version }] = await db
    .select({
      version: sql<number>`COALESCE(MAX(${schema.tableVersions.version}), 0) + 1`,
    })
    .from(schema.tableVersions)
    .where(
      and(
        eq(schema.tableVersions.tableSlug, input.tableSlug),
        eq(schema.tableVersions.ownerId, userId),
      ),
    );

  const [tableVersion] = await db
    .insert(schema.tableVersions)
    .values({
      version,
      ownerId: userId,
      tableSlug: input.tableSlug,
      title: table.title,
      definition: table.definition,
      description: input.description ?? table.description,
      availableTables: table.availableTables,
    })
    .returning()
    .execute();

  return tableVersion;
}

export async function deleteTable(userId: string, input: TableDeleteInput) {
  return db
    .update(schema.tables)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(schema.tables.ownerId, userId), eq(schema.tables.id, input.id)),
    );
}

export async function restoreTable(userId: string, input: TableRestoreInput) {
  return db
    .update(schema.tables)
    .set({ deletedAt: null })
    .where(
      and(eq(schema.tables.ownerId, userId), eq(schema.tables.id, input.id)),
    );
}

export async function listFavorites(userId: string) {
  return db.query.tables.findMany({
    where: and(
      eq(schema.tables.ownerId, userId),
      eq(schema.tables.favorited, true),
      isNull(schema.tables.deletedAt),
    ),
    orderBy: desc(schema.tables.updatedAt),
  });
}
