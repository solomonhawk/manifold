import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { initAuthConfig } from "@hono/auth-js";
import { db } from "@manifold/db";
import type { Context } from "hono";

export * from "@hono/auth-js";

type AuthInit = {
  secret: string;
  clientId: string;
  clientSecret: string;
};

export const auth = (getConfig: (c: Context) => AuthInit) =>
  initAuthConfig((c) => {
    const { secret, clientId, clientSecret } = getConfig(c);

    return {
      adapter: DrizzleAdapter(db),
      providers: [
        Google({
          clientId,
          clientSecret,
        }),
      ],
      secret,
    };
  });
