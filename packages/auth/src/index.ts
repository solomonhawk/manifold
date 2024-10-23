import Google from "@auth/core/providers/google";
import { initAuthConfig } from "@hono/auth-js";
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
      secret,
      providers: [
        Google({
          clientId,
          clientSecret,
        }),
      ],
    };
  });
