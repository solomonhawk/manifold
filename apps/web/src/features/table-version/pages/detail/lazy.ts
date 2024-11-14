import type { Handle, LazyRoute } from "~features/routing/types";
import type { TableVersionDetailLoaderData } from "~features/table-version/pages/detail/loader";
import type { TrpcUtils } from "~utils/trpc";

export function loadTableVersionDetailRoute(trpcUtils: TrpcUtils): LazyRoute {
  return async () => {
    const { TableVersionLayout, loaderBuilder } = await import(
      "~features/table-version/pages/detail"
    );

    return {
      loader: loaderBuilder(trpcUtils),
      Component: TableVersionLayout,
      handle: {
        title: ({ data }) => `Manifold | ${data.title} v${data.version}`,
        description: ({ data }) =>
          data.releaseNotes ??
          data.table.description ??
          `Details of ${data.title}.`,
      } satisfies Handle<TableVersionDetailLoaderData>,
    };
  };
}
