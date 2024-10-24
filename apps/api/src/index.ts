import "dotenv/config";

import { serve } from "@hono/node-server";
import { auth, authHandler, verifyAuth } from "@manifold/auth";
import { type Context, Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

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
 * Auth flow endpoints (sign in, sign out, oauth callbacks, etc.)
 */
app.use("/api/auth/*", authHandler());

/**
 * Verify authentication for protected endpoints
 *
 * @NOTE: As of right now all endpoints are defined in the trpc handler which
 * has it's own auth middleware. This is here to allow for non-trpc protected
 * endpoints, should they be needed.
 */
app.use("/api/protected/*", verifyAuth());

/**
 * TRPC endpoints, the bulk of the application logic
 */
app.use("/api/trpc/*", trpc());

/**
 * Format errors consistently and respond with JSON
 */
app.onError(errorHandler());

const port = Number(process.env.PORT!);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
