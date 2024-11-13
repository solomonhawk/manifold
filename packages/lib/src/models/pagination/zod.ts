import { z } from "zod";

import { DEFAULT_PER_PAGE } from "./constants";

export const paginationSchema = z.object({
  page: z
    .number()
    .gt(0)
    .or(z.string().min(1).pipe(z.coerce.number().gt(0)))
    .default(1),
  perPage: z
    .number()
    .gt(0)
    .or(z.string().min(1).pipe(z.coerce.number().gt(0)))
    .default(DEFAULT_PER_PAGE),
});
