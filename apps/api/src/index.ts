import { serve } from "@hono/node-server";
import { auth, authHandler } from "@manifold/auth";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { getEnv } from "#env.ts";
import { setAuthUser } from "#handlers/auth.ts";
import { downloadTable } from "#handlers/download-table.ts";
import { errorHandler } from "#handlers/error.ts";
import { trpc } from "#handlers/trpc.ts";
import type { Env } from "#types.ts";

const app = new Hono<Env>();

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
      secret: getEnv(c).AUTH_SECRET,
      clientId: getEnv(c).GOOGLE_CLIENT_ID,
      clientSecret: getEnv(c).GOOGLE_CLIENT_SECRET,
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
 * Auth flow endpoints (sign in, sign out, oauth callbacks, etc.)
 */
app.use("/api/auth/*", authHandler());

/**
 * Set the authed user on the hono request context, if authenticated, otherwise
 * continues to the next middleware/handler
 */
app.use("/api/*", setAuthUser());

/**
 * TRPC endpoints, the bulk of the application logic
 */
app.use("/api/trpc/*", trpc());

/**
 * Regular endpoint to download a table definition (.tbl file)
 *
 * This is awkward to support within the tRPC router for a few reasons but
 * mainly because the `superjson` transformer makes the response ill-suited
 * for a file download. It cannot easily be conditionally applied.
 */
app.use("/api/table/:id/download", downloadTable);

/**
 * Format errors consistently and respond with JSON
 */
app.onError(errorHandler());

const env = getEnv();

console.log(`Server is running on port ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
