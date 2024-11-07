import { slugify } from "@manifold/lib/utils/string";
import {
  type TableCreateInput,
  type TableDeleteInput,
  type TableGetInput,
  type TableListInput,
  type TableListOrderBy,
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
} from "drizzle-orm";

import { db } from "#db.ts";
import * as schema from "#schema/index.ts";

// @XXX: Is this really better than an IIFE with a `switch` statement? 🤔
const tableOrderByMap = {
  recently_edited: desc(schema.table.updatedAt),
  recently_not_edited: asc(schema.table.updatedAt),
  oldest: asc(schema.table.createdAt),
  newest: desc(schema.table.createdAt),
} as const satisfies Record<TableListOrderBy, SQL>;

export async function listTables(userId: string, input: TableListInput) {
  return db.query.table
    .findMany({
      where: and(
        eq(schema.table.userId, userId),
        input.includeDeleted ? undefined : isNull(schema.table.deletedAt),
      ),
      orderBy: tableOrderByMap[input.orderBy ?? "newest"],
    })
    .execute();
}

export async function createTable(userId: string, input: TableCreateInput) {
  const [table] = await db
    .insert(schema.table)
    .values({
      ...input,
      userId,
      slug: input.slug ?? slugify(input.title),
    })
    .returning()
    .execute();

  return table;
}

export async function findTable(userId: string, input: TableGetInput) {
  const [table] = await db
    .select({ ...getTableColumns(schema.table) })
    .from(schema.table)
    .leftJoin(schema.users, eq(schema.users.id, schema.table.userId))
    .leftJoin(
      schema.userProfiles,
      eq(schema.users.id, schema.userProfiles.userId),
    )
    .where(
      and(
        eq(schema.userProfiles.username, input.username),
        eq(schema.table.slug, input.slug),
        // @TODO: remove this for public tables so anyone can view them?
        eq(schema.users.id, userId),
      ),
    )
    .limit(1)
    .execute();

  return table;
}

export async function updateTable(userId: string, input: TableUpdateInput) {
  const [table] = await db
    .update(schema.table)
    .set(input)
    .where(and(eq(schema.table.userId, userId), eq(schema.table.id, input.id)))
    .returning()
    .execute();

  return table;
}

export async function deleteTable(userId: string, input: TableDeleteInput) {
  return db
    .update(schema.table)
    .set({ deletedAt: new Date() })
    .where(and(eq(schema.table.userId, userId), eq(schema.table.id, input.id)))
    .execute();
}

export async function restoreTable(userId: string, input: TableRestoreInput) {
  return db
    .update(schema.table)
    .set({ deletedAt: null })
    .where(and(eq(schema.table.userId, userId), eq(schema.table.id, input.id)))
    .execute();
}

export async function listFavorites(userId: string) {
  return db.query.table
    .findMany({
      where: and(
        eq(schema.table.userId, userId),
        eq(schema.table.favorited, true),
        isNull(schema.table.deletedAt),
      ),
      orderBy: desc(schema.table.updatedAt),
    })
    .execute();
}
