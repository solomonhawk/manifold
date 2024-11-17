import { type LoaderFunctionArgs } from "react-router-dom";

import type { TrpcUtils } from "~utils/trpc";

/**
 * Use URL sort if present and valid
 * Fallback to localStorage saved value (if valid)
 * Otherwise "newest"
 */
export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async (_args: LoaderFunctionArgs) => {
    await trpcUtils.tableVersion.summary.prefetch();
  };
}

export type DashboardLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
