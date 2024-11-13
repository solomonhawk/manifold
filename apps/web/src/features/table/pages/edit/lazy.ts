import type { Handle, LazyRoute } from "~features/routing/types";
import type { TableEditLoaderData } from "~features/table/pages/edit/loader";
import type { TrpcUtils } from "~utils/trpc";

export function loadTableEditRoute(trpcUtils: TrpcUtils): LazyRoute {
  return async () => {
    const { TableEdit, loaderBuilder } = await import(
      "~features/table/pages/edit"
    );

    return {
      loader: loaderBuilder(trpcUtils),
      Component: TableEdit,
      handle: {
        title: ({ data }) => `Manifold | Edit ${data.title}`,
        description: ({ data }) => `Edit ${data.title} table.`,
      } satisfies Handle<TableEditLoaderData>,
    };
  };
}
