import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@manifold/router";

export const trpc = () =>
  trpcServer({
    router: appRouter,
    endpoint: "/api/trpc",
    createContext(_opts, c) {
      return {
        user: c.get("authUser")?.user,
      };
    },
  });
