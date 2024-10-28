import { tableListOrderBy } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import { TABLE_LIST_ORDER_BY_STORAGE_KEY } from "~features/table/constants";
import { storage } from "~utils/storage";
import type { TrpcUtils } from "~utils/trpc";

/**
 * Use URL sort if present and valid
 * Fallback to localStorage saved value (if valid)
 * Otherwise "newest"
 */
export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URLSearchParams(request.url);
    const orderByFromUrl = tableListOrderBy.safeParse(searchParams.get("sort"));
    const savedOrderBy = await storage.getItem(TABLE_LIST_ORDER_BY_STORAGE_KEY);

    const orderBy = orderByFromUrl.success
      ? orderByFromUrl.data
      : tableListOrderBy.catch(() => "newest" as const).parse(savedOrderBy);

    await Promise.all([
      trpcUtils.table.list.prefetch({ orderBy }),

      /**
       * Only prefetch favorites if there's no existing data. By deferring this
       * to render, we can animate items as they are added and removed.
       */
      trpcUtils.table.favorites.getData()
        ? Promise.resolve()
        : trpcUtils.table.favorites.prefetch(),
    ]);

    return { orderBy };
  };
}

export type DashboardLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
