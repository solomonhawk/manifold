import { GlobalProgress } from "@manifold/ui/components/global-progress";
import { useDeferredValue, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";

import { routerBuilder } from "~features/routing/router";
import { trpc } from "~utils/trpc";

export function Router() {
  const trpcUtils = trpc.useUtils();
  const [routerInstance] = useState(() => routerBuilder(trpcUtils));

  return (
    <>
      <NavigationProgress router={routerInstance} />
      <RouterProvider router={routerInstance} />
    </>
  );
}

function NavigationProgress({
  router,
}: {
  router: ReturnType<typeof routerBuilder>;
}) {
  const [isRouteChangePending, setIsRouteChangePending] = useState(false);

  /**
   * Deferring this allows us to avoid showing the progress bar for very short
   * route state changes.
   */
  const isPending = useDeferredValue(isRouteChangePending);

  useEffect(() => {
    return router.subscribe((state) => {
      setIsRouteChangePending(
        state.navigation.state === "loading" ||
          state.navigation.state === "submitting",
      );
    });
  }, [router]);

  return <GlobalProgress isAnimating={isPending} />;
}
