import type { Handle, LazyRoute } from "~features/routing/types";
import type { TableVersionsSearchBrowseLoaderData } from "~features/table-version/pages/search-browse/loader";
import type { TrpcUtils } from "~utils/trpc";

export function loadTableVersionSearchBrowseRoute(
  trpcUtils: TrpcUtils,
): LazyRoute {
  return async () => {
    const { TableVersionsSearchBrowse, loaderBuilder } = await import(
      "~features/table-version/pages/search-browse"
    );

    return {
      loader: loaderBuilder(trpcUtils),
      Component: TableVersionsSearchBrowse,
      handle: {
        title: ({ data }) =>
          `Manifold | Browse ${data.pagination.totalItems} Tables`,
        description: () =>
          `Search and browse to discover exactly what you need.`,
      } satisfies Handle<TableVersionsSearchBrowseLoaderData>,
    };
  };
}
