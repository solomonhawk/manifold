import type { DashboardLoaderData } from "~features/dashboard/pages/root/loader";
import type { Handle, LazyRoute } from "~features/routing/types";
import type { TrpcUtils } from "~utils/trpc";

export function loadDashboardRoute(trpcUtils: TrpcUtils): LazyRoute {
  return async () => {
    const { DashboardRoot, loaderBuilder } = await import(
      "~features/dashboard/pages/root"
    );

    return {
      loader: loaderBuilder(trpcUtils),
      Component: DashboardRoot,
      handle: {
        title: () => "Manifold | Dashboard",
        description: () => "Where it all begins.",
      } satisfies Handle<DashboardLoaderData>,
    };
  };
}
