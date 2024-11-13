import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { tableRouter } from "#routers/table.ts";
import { tableVersionRouter } from "#routers/table-version.js";
import { userRouter } from "#routers/user.ts";
import { t } from "#trpc.ts";

export const appRouter = t.router({
  table: tableRouter,
  tableVersion: tableVersionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export { TRPCError } from "@trpc/server";
export * from "@trpc/server/http";
