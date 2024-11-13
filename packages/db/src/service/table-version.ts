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
  getTableColumns,
  ilike,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "#db.ts";
import { schema } from "#index.js";

export const tableVersionOrderByMap = {
  recently_edited: desc(schema.tableVersions.updatedAt),
  recently_not_edited: asc(schema.tableVersions.updatedAt),
  oldest: asc(schema.tableVersions.createdAt),
  newest: desc(schema.tableVersions.createdAt),
} as const satisfies Record<TableListOrderBy, SQL>;

export async function findTableVersion(input: TableVersionGetInput) {
  const tableVersions = await db.query.tableVersions.findMany({
    where: eq(schema.tableVersions.tableIdentifier, input.tableIdentifier),
    with: {
      table: true,
    },
    orderBy: desc(schema.tableVersions.version),
  });

  return {
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

  const tableVersions = await db
    .selectDistinctOn([schema.tableVersions.tableIdentifier], {
      ...getTableColumns(schema.tableVersions),
      table: schema.tables,
      count: countSubQuery.totalCount,
    })
    .from(schema.tableVersions)
    .where(whereFilter)
    .leftJoin(
      schema.tables,
      eq(schema.tables.tableIdentifier, schema.tableVersions.tableIdentifier),
    )
    .leftJoin(
      countSubQuery,
      eq(countSubQuery.tableIdentifier, schema.tableVersions.tableIdentifier),
    )
    .orderBy(
      schema.tableVersions.tableIdentifier,
      tableVersionOrderByMap[input.orderBy ?? "newest"],
    )
    .limit(limit)
    .offset(offset);

  return {
    data: tableVersions,
    pagination: pagination.toMetadata({
      count: tableVersions.length ? tableVersions[0].count : 0,
    }),
  };
}
