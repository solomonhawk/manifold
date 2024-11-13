import { paginationSchema } from "@manifold/lib/models/pagination";
import { z } from "zod";

import { tableListOrderBy } from "./helpers";

export const tableVersionGetInput = z.object({
  tableIdentifier: z.string(),
});

export type TableVersionGetInput = z.infer<typeof tableVersionGetInput>;

export const tableVersionListInput = z
  .object({
    orderBy: tableListOrderBy,
    searchQuery: z.string().optional(),
  })
  .merge(paginationSchema);

export type TableVersionListInput = z.infer<typeof tableVersionListInput>;
