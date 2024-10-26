import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import type { Context } from "hono";
import { env } from "hono/adapter";
import { z } from "zod";

export const getEnv = (c?: Context) =>
  createEnv({
    server: {
      PORT: z.coerce.number().default(3000),
      DATABASE_URL: z.string(),
      AUTH_SECRET: z.string(),
      AUTH_URL: z.string(),
      GOOGLE_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
    },
    client: {},
    clientPrefix: "PUBLIC_",
    runtimeEnv: c ? env(c) : process.env,
    emptyStringAsUndefined: true,
  });
