import { z } from "@manifold/validators";

const positiveInt = z.coerce.number().positive().int();

export const tableVersionDetailParams = {
  username: z.string(),
  slug: z.string(),
  version: positiveInt.or(z.string().pipe(positiveInt)),
};
