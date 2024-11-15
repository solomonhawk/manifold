import { tableListOrderBy } from "@manifold/validators";
import { type LoaderFunctionArgs } from "react-router-dom";

import { TABLE_VERSION_LIST_ORDER_BY_STORAGE_KEY } from "~features/table-version/constants";
import { tableVersionSearchBrowseParams } from "~features/table-version/pages/search-browse/params";
import { storage } from "~utils/storage";
import type { TrpcUtils } from "~utils/trpc";

export function loaderBuilder(trpcUtils: TrpcUtils) {
  return async ({ request }: LoaderFunctionArgs) => {
    const urlParams = tableVersionSearchBrowseParams.parse(
      Object.fromEntries(
        new URLSearchParams(new URL(request.url).searchParams).entries(),
      ),
    );

    const savedOrderBy = await storage.getItem(
      TABLE_VERSION_LIST_ORDER_BY_STORAGE_KEY,
    );

    const orderBy =
      urlParams.sort ??
      tableListOrderBy.catch(() => "newest" as const).parse(savedOrderBy);

    const tableVersions = await trpcUtils.tableVersion.list.fetch({
      orderBy,
      page: urlParams.page,
      perPage: urlParams.perPage,
      searchQuery: urlParams.q,
    });

    return {
      orderBy,
      searchQuery: urlParams.q,
      pagination: tableVersions.pagination,
      tableVersions: tableVersions.data,
    };
  };
}

export type TableVersionsSearchBrowseLoaderData = Awaited<
  ReturnType<ReturnType<typeof loaderBuilder>>
>;
