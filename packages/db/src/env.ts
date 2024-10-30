import "dotenv/config";

import { createEnv, z } from "@manifold/env";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
  },
  client: {},
  clientPrefix: "PUBLIC_",
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
