import { z } from "zod";

import { optionalSlug } from "./schemas";

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

export type TableListInput = z.infer<typeof tableListInput>;

export const tableCreateInput = z.object({
  title: z.string().min(1, { message: "Title can’t be blank" }),
  slug: optionalSlug({
    message:
      "Identifier is invalid. Can only contain lowercase letters, numbers, and hyphens",
  }),
  description: z.string().optional(),
  definition: z.string(),
});

export type TableCreateInput = z.infer<typeof tableCreateInput>;

export const tableGetInput = z.object({
  username: z.string(),
  slug: z.string(),
});

export type TableGetInput = z.infer<typeof tableGetInput>;

export const tableUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  definition: z.string().optional(),
  favorited: z.boolean().optional(),
});

export type TableUpdateInput = z.infer<typeof tableUpdateInput>;

export const tablePublishVersionInput = z.object({
  tableSlug: z.string(),
  description: z.string().optional(),
});

export type TablePublishVersionInput = z.infer<typeof tablePublishVersionInput>;

export const tableDeleteInput = z.object({
  id: z.string(),
});

export type TableDeleteInput = z.infer<typeof tableDeleteInput>;

export const tableRestoreInput = z.object({
  id: z.string(),
});

export type TableRestoreInput = z.infer<typeof tableRestoreInput>;
