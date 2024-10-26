import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
  },
  client: {},
  clientPrefix: "PUBLIC_",
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
