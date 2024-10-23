import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { auth, authHandler, verifyAuth } from "@manifold/auth";
import { appRouter } from "@manifold/router";
import dotenv from "dotenv";
import { type Context, Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

dotenv.config();

type Bindings = {
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

type Env = { Bindings: Bindings };

const app = new Hono<Env>();

app.use(logger());

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

app.use("*", cors());

app.use("/api/auth/*", authHandler());

// app.use("/api/*", verifyAuth());

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/api/trpc",
  }),
);

// app.get("/", (c) => {
//   console.log(c.get("authConfig"));
//   console.log(c.get("authUser"));
//   return c.text("Hello, world!");
// });

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(err.message, 500);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
