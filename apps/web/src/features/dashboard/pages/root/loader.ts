import { type LoaderFunctionArgs } from "react-router-dom";

import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async (_args: LoaderFunctionArgs) => {
    await Promise.all([
      trpcUtils.table.list.prefetch(),
      trpcUtils.table.favorites.prefetch(),
    ]);

    return null;
  };
}
