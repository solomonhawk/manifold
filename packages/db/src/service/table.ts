import { buildTableIdentifier, slugify } from "@manifold/lib";
import {
  invalidTableSlugMessage,
  slug,
  type TableCreateInput,
  tableCreateInput,
  type TableDeleteInput,
  type TableFindDependenciesInput,
  type TableGetInput,
  type TableListInput,
  type TableListOrderBy,
  type TablePublishVersionInput,
  type TableResolveDependenciesInput,
  type TableRestoreInput,
  type TableUpdateInput,
} from "@manifold/validators";
import {
  and,
  arrayContains,
  asc,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  isNull,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "#db.ts";
import * as schema from "#schema/index.ts";
import type { TableVersionSummary } from "#types.ts";

export const tableOrderByMap = {
  recently_edited: desc(schema.tables.updatedAt),
  recently_not_edited: asc(schema.tables.updatedAt),
  oldest: asc(schema.tables.createdAt),
  newest: desc(schema.tables.createdAt),
} as const satisfies Record<TableListOrderBy, SQL>;

export async function listTables(userId: string, input: TableListInput) {
  return db.query.tables.findMany({
    where: and(
      eq(schema.tables.ownerId, userId),
      input.includeDeleted ? undefined : isNull(schema.tables.deletedAt),
    ),
    orderBy: tableOrderByMap[input.orderBy ?? "newest"],
  });
}

export async function createTable(
  userId: string,
  username: string,
  input: TableCreateInput,
) {
  const inputWithDefaultSlug = tableCreateInput
    .extend({
      slug: slug({ message: invalidTableSlugMessage }),
    })
    .parse({
      ...input,
      slug: input.slug ?? slugify(input.title),
    });

  const [table] = await db
    .insert(schema.tables)
    .values({
      ...inputWithDefaultSlug,
      tableIdentifier: buildTableIdentifier(
        username,
        inputWithDefaultSlug.slug,
      ),
      ownerId: userId,
      ownerUsername: username,
    })
    .returning()
    .execute();

  return table;
}

/**
 * @TODO @XXX: fix this query now that the tables have `tableIdentifier` columns
 */
export async function findTable(input: TableGetInput) {
  const tableVersionsSubQuery = db
    .select({
      // @TODO: Drizzle doesn't correctly map/alias the subquery columns so they
      // end up as the snake_case (db) keys in the final result. Is this a bug?
      // ...getTableColumns(schema.tableVersions),
      id: sql`${schema.tableVersions.id}`.mapWith(String),
      version: sql`${schema.tableVersions.version}`.mapWith(Number),
      tableIdentifier: sql`${schema.tableVersions.tableIdentifier}`.as(
        "tableIdentifier",
      ),
      tableSlug: sql`${schema.tableVersions.tableSlug}`.as("tableSlug"),
      definition: sql`${schema.tableVersions.definition}`,
      releaseNotes: sql`${schema.tableVersions.releaseNotes}`.as(
        "releaseNotes",
      ),
      ownerId: sql`${schema.tableVersions.ownerId}`.as("ownerId"),
      createdAt: sql`${schema.tableVersions.createdAt}`.as("createdAt"),
      availableTables: sql`${schema.tableVersions.availableTables}`.as(
        "availableTables",
      ),
      count: sql`count(*) over()`.mapWith(Number).as("count"),
    })
    .from(schema.tableVersions)
    .where(and(eq(schema.tableVersions.tableIdentifier, input.tableIdentifier)))
    .orderBy(desc(schema.tableVersions.version))
    .limit(
      input.versionsCount === "all"
        ? Number.MAX_SAFE_INTEGER
        : input.versionsCount,
    )
    .as("tableVersions");

  const [table] = await db
    .select({
      ...getTableColumns(schema.tables),
      // @NOTE: `jsonb_agg` appears to nuke the Drizzle mapped types (e.g.
      // `createdAt` gets serialized to a string instead of the mapped Date type
      // for that column). I'd like to just use the mapped types here (e.g. `createdAt: Date`)...
      recentVersions: sql<
        TableVersionSummary[]
      >`COALESCE(jsonb_agg("tableVersions") FILTER (WHERE "tableVersions"."id" IS NOT NULL), '[]'::jsonb)`.as(
        "recentVersions",
      ),
      totalVersionCount: sql`COALESCE(${tableVersionsSubQuery.count}, 0)`
        .mapWith(Number)
        .as("totalVersionCount"),
    })
    .from(schema.tables)
    .leftJoin(
      tableVersionsSubQuery,
      and(
        eq(
          schema.tables.tableIdentifier,
          tableVersionsSubQuery.tableIdentifier,
        ),
      ),
    )
    .where(and(eq(schema.tables.tableIdentifier, input.tableIdentifier)))
    .groupBy(
      schema.tables.ownerUsername,
      schema.tables.slug,
      tableVersionsSubQuery.count,
    );

  return table;
}

export async function findDependencies(input: TableFindDependenciesInput) {
  return await db
    .selectDistinctOn([schema.tableVersions.tableIdentifier], {
      ...getTableColumns(schema.tableVersions),
      table: schema.tables,
    })
    .from(schema.tableVersions)
    .where(
      or(
        ilike(schema.tableVersions.title, `%${input.searchQuery}%`),
        ilike(schema.tableVersions.tableSlug, `%${input.searchQuery}%`),
        ilike(schema.tableVersions.tableIdentifier, `%${input.searchQuery}%`),
        arrayContains(schema.tableVersions.availableTables, [
          input.searchQuery,
        ]),
      ),
    )
    .leftJoin(
      schema.tables,
      eq(schema.tables.tableIdentifier, schema.tableVersions.tableIdentifier),
    )
    .orderBy(
      schema.tableVersions.tableIdentifier,
      desc(schema.tableVersions.updatedAt),
    );
}

export async function resolveDependencies(
  input: TableResolveDependenciesInput,
) {
  const tableVersions = await db
    .selectDistinctOn([schema.tableVersions.tableIdentifier])
    .from(schema.tableVersions)
    .where(inArray(schema.tableVersions.tableIdentifier, input.dependencies))
    .orderBy(
      schema.tableVersions.tableIdentifier,
      desc(schema.tableVersions.version),
    );

  if (tableVersions.length !== input.dependencies.length) {
    throw new Error("Some dependencies could not be resolved");
  }

  return tableVersions;
}

export async function listTableVersions(
  input: {
    tableIdentifier: string;
    version: number;
  }[],
) {
  if (input.length === 0) {
    return [];
  }

  const dependencyPairs = input
    .map(({ tableIdentifier: ti, version: v }) => `('${ti}', ${v})`)
    .join(", ");

  /**
   * @TS: would rather not use a raw query here so we can rely on drizzle
   * to serialize the table columns, but having trouble we specifying the
   * VALUES pairs (maybe because they're aren't homogeneous types?)
   *
   * Example query:
   *   SELECT DISTINCT ON ("table_version"."table_identifier") [ ... selected columns ... ]
   *   FROM "table_version"
   *   WHERE EXISTS (
   *     SELECT 1
   *     FROM (
   *       VALUES ('@solomonhawk/dragon-snacks', 6), ('@solomonhawk/creature', 1)
   *     ) AS pairs(table_identifier, version)
   *     WHERE pairs.table_identifier = table_version.table_identifier AND pairs.version = table_version.version
   *   )
   */
  const whereClause = sql.raw(`EXISTS (
      SELECT 1
      FROM (VALUES ${dependencyPairs}) AS pairs(table_identifier, version)
      WHERE pairs.table_identifier = table_version.table_identifier AND pairs.version = table_version.version
  )`);

  return await db
    .selectDistinctOn([schema.tableVersions.tableIdentifier])
    .from(schema.tableVersions)
    .where(whereClause);
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
  const table = await findTable({
    tableIdentifier: input.tableIdentifier,
    versionsCount: 3,
  });

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
      tableIdentifier: input.tableIdentifier,
      ownerId: userId,
      ownerUsername: username,
      tableSlug: input.tableSlug,
      title: table.title,
      definition: table.definition,
      releaseNotes: input.releaseNotes,
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
