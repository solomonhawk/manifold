import type { TableInsert, UserProfileInsert } from "@manifold/db";
import { slugify } from "@manifold/lib/utils/string";
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

export const tableListInput = z.object({
  orderBy: tableListOrderBy,
  includeDeleted: z.boolean().default(false),
});

export const tableCreateInput = z.object({
  title: z.string().min(1, { message: "Title can’t be blank" }),
  slug: z
    .string()
    .optional()
    .transform((x) => (x === "" ? undefined : x))
    .refine(
      (slug) => {
        if (slug === undefined) {
          return true;
        }

        return slug === slugify(slug);
      },
      {
        message:
          "Identifier is invalid. Can only contain lowercase letters, numbers, and hyphens",
      },
    ),
  description: z.string().optional(),
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

export const userProfileCreateInput = z.object({
  description: z.string().optional(),
  username: z.string().min(1, { message: "Username can’t be blank" }),
}) satisfies ZodType<Omit<UserProfileInsert, "userId">>;

export * from "zod";
