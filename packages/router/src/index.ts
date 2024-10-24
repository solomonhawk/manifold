import { tableRouter } from "#routers/table.ts";
import { t } from "#trpc.ts";

export const appRouter = t.router({
  table: tableRouter,
});

export type AppRouter = typeof appRouter;

export { TRPCError } from "@trpc/server";
export * from "@trpc/server/http";
