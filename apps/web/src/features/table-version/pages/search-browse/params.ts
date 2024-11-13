import { paginationSchema } from "@manifold/lib/models/pagination";
import { tableListOrderBy, z } from "@manifold/validators";

export const tableVersionSearchBrowseParams = z
  .object({
    orderBy: tableListOrderBy.optional(),
    q: z.string().optional(),
  })
  .merge(paginationSchema);
