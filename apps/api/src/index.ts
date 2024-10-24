import "dotenv/config";

import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { auth, authHandler } from "@manifold/auth";
import { appRouter } from "@manifold/router";
import { type Context, Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { errorHandler } from "#error-handler.ts";
import type { Env } from "#types.ts";

const app = new Hono<Env>({
  strict: true,
});

/**
 * Enable stdout logging
 */
app.use(logger());

/**
 * Auth middleware - initializes configuration (e.g. providers) for auth.js
 */
app.use(
  "*",
  auth((c: Context<Env>) => {
    return {
      secret: env(c).AUTH_SECRET,
      clientId: env(c).GOOGLE_CLIENT_ID,
      clientSecret: env(c).GOOGLE_CLIENT_SECRET,
    };
  }),
);

/**
 * Enable Cross-Origin Resource Sharing (CORS) for the client
 */
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
  }),
);

/**
 * Auth endpoints
 */
app.use("/api/auth/*", authHandler());

/**
 * Verify authenticated user for all trpc endpoints
 *
 * @TODO: this prevents public procetures in the trpc router from working, so
 * an approach is needed to allow for both public and private procedures
 */
// app.use("/api/trpc/*", verifyAuth());

/**
 * TRPC endpoints, the bulk of the application logic
 */
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/api/trpc",
    createContext(_opts, c) {
      return {
        user: c.get("authUser")?.user,
      };
    },
  }),
);

app.onError(errorHandler());

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
