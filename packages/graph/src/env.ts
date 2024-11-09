import "dotenv/config";

import { createEnv, z } from "@manifold/env";

export const env = createEnv({
  server: {
    GRAPH_DATABASE_URL: z.string(),
    GRAPH_DATABASE_NAME: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
