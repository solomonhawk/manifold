import { useSession } from "@manifold/auth/client";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { RouterProvider } from "react-router-dom";

import { NavigationProgress } from "~features/routing/components/navigation-progress";
import {
  buildAppRoutes,
  guestLoaderBuilder,
  protectedLoaderBuilder,
  routerBuilder,
} from "~features/routing/router";
import { routesAtom } from "~features/routing/state";
import { trpc } from "~utils/trpc";

export function Router() {
  const auth = useSession();
  const trpcUtils = trpc.useUtils();
  const setRoutes = useSetAtom(routesAtom);

  const guestLoader = useMemo(() => guestLoaderBuilder(auth), [auth]);
  const protectedLoader = useMemo(() => protectedLoaderBuilder(auth), [auth]);

  const routes = useMemo(
    () => buildAppRoutes({ trpcUtils, guestLoader, protectedLoader }),
    [trpcUtils, guestLoader, protectedLoader],
  );

  const routerInstance = useMemo(() => routerBuilder(routes), [routes]);

  /**
   * Make built routes available to descendents (e.g. <PrefetchableLink />)
   */
  useEffect(() => {
    setRoutes(routes);
  }, [routes, setRoutes]);

  return (
    <>
      <NavigationProgress router={routerInstance} />
      <RouterProvider
        router={routerInstance}
        fallbackElement={<FullScreenLoader />}
        future={{
          v7_startTransition: true,
        }}
      />
    </>
  );
}
