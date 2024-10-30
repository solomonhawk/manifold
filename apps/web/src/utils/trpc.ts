import type { AppRouter } from "@manifold/router";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import { env } from "~env";

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
      url: new URL("/api/trpc", env.PUBLIC_API_BASE_URL).toString(),
    }),
  ],
});

export type TrpcUtils = ReturnType<typeof trpc.useUtils>;
