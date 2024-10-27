import type { AppRouter } from "@manifold/router";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

/**
 * This type annotation feels unnecessary, but `tsc` chokes without it.
 *
 * @ref https://github.com/microsoft/TypeScript/issues/42873#issuecomment-2066874644
 * @ref https://github.com/microsoft/TypeScript/pull/58176#issuecomment-2052698294
 */
export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "http://localhost:5173/api/trpc",
    }),
  ],
});

export type TrpcUtils = ReturnType<typeof trpc.useUtils>;
