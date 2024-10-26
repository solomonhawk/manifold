import "dotenv/config";

import { serve } from "@hono/node-server";
import { auth, authHandler } from "@manifold/auth";
import { type Context, Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { setAuthUser } from "#handlers/auth.ts";
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
 * Set the authed user on the hono request context, if authenticated, otherwise
 * continues to the next middleware/handler
 */
app.use("/api/*", setAuthUser());

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
