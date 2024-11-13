import type { Handle, LazyRoute } from "~features/routing/types";
import type { TableDetailLoaderData } from "~features/table/pages/detail/loader";
import type { TrpcUtils } from "~utils/trpc";

export function loadTableDetailRoute(trpcUtils: TrpcUtils): LazyRoute {
  return async () => {
    const { TableDetail, loaderBuilder } = await import(
      "~features/table/pages/detail"
    );

    return {
      loader: loaderBuilder(trpcUtils),
      Component: TableDetail,
      handle: {
        title: ({ data }) => `Manifold | ${data.title}`,
        description: ({ data }) =>
          data.description ?? `Details of ${data.title}.`,
      } satisfies Handle<TableDetailLoaderData>,
    };
  };
}
