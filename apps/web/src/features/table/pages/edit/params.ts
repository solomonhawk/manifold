import { z } from "@manifold/validators";

export const tableEditParams = {
  username: z.string(),
  slug: z.string(),
};
