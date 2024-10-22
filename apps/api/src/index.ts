import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@manifold/router";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/trpc/*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  }),
);

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
