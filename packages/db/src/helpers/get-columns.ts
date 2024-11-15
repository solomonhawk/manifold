/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types  */
import {
  type ColumnsSelection,
  is,
  type Subquery,
  Table,
  View,
  ViewBaseConfig,
} from "drizzle-orm";
import type { AnyMySqlSelect } from "drizzle-orm/mysql-core";
import type { AnyPgSelect } from "drizzle-orm/pg-core";
import type { AnySQLiteSelect } from "drizzle-orm/sqlite-core";
import type { WithSubquery } from "drizzle-orm/subquery";

// https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts#L58
type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

type Select = AnyPgSelect | AnyMySqlSelect | AnySQLiteSelect;
type AnySelect = Simplify<
  Omit<Select, "where"> & Partial<Pick<Select, "where">>
>;

/**
 * Drizzle ORM does not properly alias columns in subqueries. Their
 * `getColumnNames` function also does not work with subqueries.
 *
 * See https://github.com/drizzle-team/drizzle-orm/pull/1789
 */
export function getColumns<
  T extends
    | Table
    | View
    | Subquery<string, ColumnsSelection>
    | WithSubquery<string, ColumnsSelection>
    | AnySelect,
>(
  table: T,
): T extends Table
  ? T["_"]["columns"]
  : T extends View | Subquery | WithSubquery | AnySelect
    ? T["_"]["selectedFields"]
    : never {
  return is(table, Table)
    ? (table as any)[(Table as any).Symbol.Columns]
    : is(table, View)
      ? (table as any)[ViewBaseConfig].selectedFields
      : table._.selectedFields;
}
