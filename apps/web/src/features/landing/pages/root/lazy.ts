import type { LoaderFunction } from "react-router-dom";

import type { Handle, LazyRoute } from "~features/routing/types";
import type { TrpcUtils } from "~utils/trpc";

export function loadLandingRoute(
  guestLoader: LoaderFunction,
  trpcUtils: TrpcUtils,
): LazyRoute {
  return async () => {
    const { LandingRoot, loaderBuilder } = await import(
      "~features/landing/pages/root"
    );

    return {
      loader: (args) => {
        return guestLoader(args) ?? loaderBuilder(trpcUtils);
      },
      Component: LandingRoot,
      handle: {
        title: () => "Manifold | Welcome",
        description: () =>
          "A tool for curating your collection of random tables.",
      } satisfies Handle,
    };
  };
}
