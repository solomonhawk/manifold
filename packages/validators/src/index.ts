import type { TableInsert } from "@manifold/db/schema/table";
import { z, type ZodType } from "zod";

export const tableCreateInput = z.object({
  title: z.string(),
  definition: z.string(),
}) satisfies ZodType<Omit<TableInsert, "userId">>;
