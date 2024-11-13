import { z } from "zod";

import { tableListOrderBy } from "./helpers";
import { optionalSlug } from "./schemas";

export const tableListInput = z.object({
  orderBy: tableListOrderBy,
  includeDeleted: z.boolean().default(false),
});

export type TableListInput = z.infer<typeof tableListInput>;

export const invalidTableSlugMessage =
  "Identifier is invalid. Can only contain lowercase letters, numbers, and hyphens";

export const tableCreateInput = z.object({
  title: z.string().min(1, { message: "Title can’t be blank" }).max(64, {
    message: "Title must be 64 characters or less",
  }),
  slug: optionalSlug({
    message: invalidTableSlugMessage,
  }),
  description: z.string().optional(),
  definition: z.string(),
});

export type TableCreateInput = z.infer<typeof tableCreateInput>;

export const tableGetInput = z.object({
  tableIdentifier: z.string(),
});

export type TableGetInput = z.infer<typeof tableGetInput>;

export const tableFindDependenciesInput = z.object({
  searchQuery: z.string().min(1, { message: "Search query can’t be blank" }),
});

export type TableFindDependenciesInput = z.infer<
  typeof tableFindDependenciesInput
>;

export const tableResolveDependenciesInput = z.object({
  dependencies: z.array(z.string()), // ["@username/table-id", ...]
});

export type TableResolveDependenciesInput = z.infer<
  typeof tableResolveDependenciesInput
>;

export const tableUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  definition: z.string().optional(),
  favorited: z.boolean().optional(),
  availableTables: z.array(z.string()).default([]),
  dependencies: z
    .array(
      z.object({
        dependencyIdentifier: z.string(),
        dependencyVersion: z.number(),
      }),
    )
    .optional(),
});

export type TableUpdateInput = z.infer<typeof tableUpdateInput>;

export const tablePublishVersionInput = z.object({
  tableId: z.string(),
  tableSlug: z.string(),
  tableIdentifier: z.string(),
  releaseNotes: z.string().optional(),
  dependencies: z.array(
    z.object({
      dependencyIdentifier: z.string(),
      dependencyVersion: z.number(),
    }),
  ),
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
