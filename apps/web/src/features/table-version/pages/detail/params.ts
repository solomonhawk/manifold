import { z } from "@manifold/validators";

export const tableVersionDetailParams = {
  username: z.string(),
  slug: z.string(),
};
