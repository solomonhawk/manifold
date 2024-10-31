import { createEnv, z } from "@manifold/env";

export const env = createEnv({
  server: {
    API_PROXY_URL: z.string(),
  },
  client: {
    PUBLIC_API_BASE_URL: z.string(),
  },
  clientPrefix: "PUBLIC_",
  runtimeEnv: import.meta.env,
});

export type Env = typeof env;
