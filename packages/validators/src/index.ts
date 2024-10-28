import type { TableInsert } from "@manifold/db/schema/table";
import { z, type ZodType } from "zod";

export type TableListOrderBy =
  | "newest"
  | "oldest"
  | "recently_edited"
  | "recently_not_edited";

export const tableListOrderByMapping = {
  newest: "Newest",
  oldest: "Oldest",
  recently_edited: "Recently Edited",
  recently_not_edited: "Recently Not Edited",
} as const satisfies Record<TableListOrderBy, string>;

export const tableListOrderBy = z
  .enum([
    "newest",
    "oldest",
    "recently_edited",
    "recently_not_edited",
  ] as const satisfies TableListOrderBy[])
  .default("newest");

export const tableListInput = z
  .object({
    orderBy: tableListOrderBy,
  })
  .optional();

export const tableCreateInput = z.object({
  title: z.string().min(1, { message: "Title can’t be blank" }),
  definition: z.string(),
}) satisfies ZodType<Omit<TableInsert, "userId">>;

export const tableGetInput = z.string();

export const tableUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  definition: z.string().optional(),
  favorited: z.boolean().optional(),
}) satisfies ZodType<Partial<TableInsert>>;

export const tableDeleteInput = z.string();

export * from "zod";
