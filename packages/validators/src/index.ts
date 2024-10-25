import type { TableInsert } from "@manifold/db/schema/table";
import { z, type ZodType } from "zod";

export const tableCreateInput = z.object({
  title: z.string().min(1, { message: "Title can’t be blank" }),
  definition: z.string(),
}) satisfies ZodType<Omit<TableInsert, "userId">>;

export const tableUpdateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  definition: z.string().optional(),
}) satisfies ZodType<Partial<TableInsert>>;

export * from "zod";
