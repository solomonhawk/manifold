import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import { RouterProvider } from "react-router-dom";

import { useAuth } from "~features/auth/hooks/use-auth";
import { NavigationProgress } from "~features/routing/components/navigation-progress";
import {
  buildAppRoutes,
  guestLoaderBuilder,
  protectedLoaderBuilder,
  routerBuilder,
} from "~features/routing/router";
import { routerAtom, routesAtom } from "~features/routing/state";
import { trpc } from "~utils/trpc";

export function Router() {
  const session = useAuth();
  const trpcUtils = trpc.useUtils();
  const setRoutes = useSetAtom(routesAtom);
  const setRouter = useSetAtom(routerAtom);

  const guestLoader = useMemo(() => guestLoaderBuilder(session), [session]);
  const protectedLoader = useMemo(
    () => protectedLoaderBuilder(session),
    [session],
  );

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

  /**
   * Make router instance available for descendents (e.g. Drawers/Dialogs) to
   * listen to route changes
   */
  useEffect(() => {
    setRouter(routerInstance);
  }, [routerInstance, setRouter]);

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
