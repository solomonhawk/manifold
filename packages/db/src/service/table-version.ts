import { PaginationParamsModel } from "@manifold/lib/models/pagination";
import type {
  TableListOrderBy,
  TableVersionGetInput,
  TableVersionListInput,
} from "@manifold/validators";
import {
  arrayContains,
  asc,
  desc,
  eq,
  ilike,
  isNull,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "#db.ts";
import { getColumns } from "#helpers/get-columns.js";

import * as schema from "../schema";

export const tableVersionOrderByMap = {
  recently_edited: desc(schema.tableVersions.updatedAt),
  recently_not_edited: asc(schema.tableVersions.updatedAt),
  oldest: asc(schema.tableVersions.createdAt),
  newest: desc(schema.tableVersions.createdAt),
} as const satisfies Record<TableListOrderBy, SQL>;

export async function getSummary() {
  const [{ authorCount, tablesCount, tableVersionsCount }] = await db
    .select({
      tablesCount: sql`count(distinct ${schema.tableVersions.tableIdentifier})`
        .mapWith(Number)
        .as("tablesCount"),
      tableVersionsCount: sql`count(*)`
        .mapWith(Number)
        .as("tableVersionsCount"),
      authorCount: sql`count(distinct ${schema.tableVersions.ownerId})`
        .mapWith(Number)
        .as("authorCount"),
    })
    .from(schema.tableVersions)
    .where(isNull(schema.tableVersions.deletedAt));

  return {
    authorCount,
    tablesCount,
    tableVersionsCount,
  };
}

export async function findTableVersion(input: TableVersionGetInput) {
  const tableVersions = await db.query.tableVersions.findMany({
    where: eq(schema.tableVersions.tableIdentifier, input.tableIdentifier),
    with: {
      table: true,
    },
    orderBy: desc(schema.tableVersions.version),
  });

  const tableVersion = tableVersions.find((v) => v.version === input.version);

  if (!tableVersion) {
    return null;
  }

  return {
    ...tableVersion,
    table: tableVersions[0].table,
    versions: tableVersions,
  };
}

export async function listTableVersions(input: TableVersionListInput) {
  const pagination = new PaginationParamsModel(input.page, input.perPage);
  const { limit, offset } = pagination.toQuery();

  const whereFilter: SQL | undefined = input.searchQuery
    ? or(
        ilike(schema.tableVersions.title, `%${input.searchQuery}%`),
        ilike(schema.tableVersions.tableSlug, `%${input.searchQuery}%`),
        ilike(schema.tableVersions.tableIdentifier, `%${input.searchQuery}%`),
        arrayContains(schema.tableVersions.availableTables, [
          input.searchQuery,
        ]),
      )
    : undefined;

  const countSubQuery = await db
    .selectDistinctOn([schema.tableVersions.tableIdentifier], {
      tableIdentifier: schema.tableVersions.tableIdentifier,
      totalCount: sql`count(*) over()`.mapWith(Number).as("count"),
    })
    .from(schema.tableVersions)
    .where(whereFilter)
    .groupBy(schema.tableVersions.tableIdentifier)
    .as("countSubQuery");

  const distinctTableVersions = await db
    .selectDistinctOn([schema.tableVersions.tableIdentifier])
    .from(schema.tableVersions)
    .where(whereFilter)
    .orderBy(
      schema.tableVersions.tableIdentifier,
      desc(schema.tableVersions.createdAt),
    )
    .as("distinctTableVersions");

  const distinctTableVersionOrderByMap = {
    recently_edited: desc(distinctTableVersions.updatedAt),
    recently_not_edited: asc(distinctTableVersions.updatedAt),
    oldest: asc(distinctTableVersions.createdAt),
    newest: desc(distinctTableVersions.createdAt),
  } as const satisfies Record<TableListOrderBy, SQL>;

  const tableVersions = await db
    .select({
      ...getColumns(distinctTableVersions),
      table: schema.tables,
      totalCount: countSubQuery.totalCount,
    })
    .from(distinctTableVersions)
    .leftJoin(
      countSubQuery,
      eq(countSubQuery.tableIdentifier, distinctTableVersions.tableIdentifier),
    )
    .innerJoin(
      schema.tables,
      eq(schema.tables.tableIdentifier, distinctTableVersions.tableIdentifier),
    )
    .orderBy(distinctTableVersionOrderByMap[input.orderBy ?? "newest"])
    .limit(limit)
    .offset(offset);

  return {
    data: tableVersions.map((tableVersion) => ({
      id: tableVersion.id,
      title: tableVersion.title,
      tableSlug: tableVersion.tableSlug,
      tableIdentifier: tableVersion.tableIdentifier,
      ownerUsername: tableVersion.ownerUsername,
      availableTables: tableVersion.availableTables,
      createdAt: tableVersion.createdAt,
      updatedAt: tableVersion.updatedAt,
      table: {
        title: tableVersion.table.title,
        description: tableVersion.table.description,
      },
    })),
    pagination: pagination.toMetadata({
      count: tableVersions.length ? tableVersions[0].totalCount : 0,
    }),
  };
}
