import "dotenv/config";

import { createEnv, z } from "@manifold/env";
import type { Context } from "hono";
import { env } from "hono/adapter";

export const getEnv = (c?: Context) =>
  createEnv({
    server: {
      NODE_ENV: z.enum(["development", "production"]).default("development"),
      PORT: z.coerce.number().default(3000),
      DATABASE_URL: z.string(),
      AUTH_SECRET: z.string(),
      AUTH_URL: z.string(),
      GOOGLE_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
    },
    runtimeEnv: c ? env(c) : process.env,
    emptyStringAsUndefined: true,
  });
