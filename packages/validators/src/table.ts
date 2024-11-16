import { z } from "zod";

import { invalidTableSlugMessage } from "./constants";
import { tableListOrderBy } from "./helpers";
import { optionalSlug } from "./schemas";

export const tableListInput = z.object({
  orderBy: tableListOrderBy,
  includeDeleted: z.boolean().default(false),
});

export type TableListInputRaw = z.input<typeof tableListInput>;
export type TableListInput = z.infer<typeof tableListInput>;

export const tableCreateInput = z.object({
  title: z.string().min(1, { message: "Title can’t be blank" }).max(64, {
    message: "Title must be 64 characters or less",
  }),
  slug: optionalSlug({
    message: invalidTableSlugMessage,
  }),
  description: z.string().optional(),
  definition: z.string(),
  availableTables: z.array(z.string()).default([]),
});

export type TableCreateInputRaw = z.input<typeof tableCreateInput>;
export type TableCreateInput = z.infer<typeof tableCreateInput>;

export const tableCopyInput = z.object({
  tableId: z.string(),
  title: z.string().min(1, { message: "Title can’t be blank" }).max(64, {
    message: "Title must be 64 characters or less",
  }),
  slug: optionalSlug({
    message: invalidTableSlugMessage,
  }),
  description: z.string().optional(),
});

export type TableCopyInputRaw = z.input<typeof tableCopyInput>;
export type TableCopyInput = z.infer<typeof tableCopyInput>;

export const tableGetInput = z.object({
  tableIdentifier: z.string(),
  versionsCount: z
    .union([z.literal("all"), z.number().positive().int()])
    .default("all"),
});

export type TableGetInputRaw = z.input<typeof tableGetInput>;
export type TableGetInput = z.infer<typeof tableGetInput>;

export const tableFindDependenciesInput = z.object({
  searchQuery: z.string().min(1, { message: "Search query can’t be blank" }),
});

export type TableFindDependenciesInputRaw = z.input<
  typeof tableFindDependenciesInput
>;
export type TableFindDependenciesInput = z.infer<
  typeof tableFindDependenciesInput
>;

export const tableResolveDependenciesInput = z.object({
  dependencies: z.array(z.string()), // ["@username/table-id", ...]
});

export type TableResolveDependenciesInputRaw = z.input<
  typeof tableResolveDependenciesInput
>;
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

export type TableUpdateInputRaw = z.input<typeof tableUpdateInput>;
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

export type TablePublishVersionInputRaw = z.input<
  typeof tablePublishVersionInput
>;
export type TablePublishVersionInput = z.infer<typeof tablePublishVersionInput>;

export const tableDeleteInput = z.object({
  id: z.string(),
});

export type TableDeleteInputRaw = z.input<typeof tableDeleteInput>;
export type TableDeleteInput = z.infer<typeof tableDeleteInput>;

export const tableRestoreInput = z.object({
  id: z.string(),
});

export type TableRestoreInputRaw = z.input<typeof tableRestoreInput>;
export type TableRestoreInput = z.infer<typeof tableRestoreInput>;
