import "dotenv/config";

import { createEnv, z } from "@manifold/env";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
