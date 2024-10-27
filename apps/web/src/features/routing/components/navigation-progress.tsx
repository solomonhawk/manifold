import { GlobalProgress } from "@manifold/ui/components/global-progress";
import { useDeferredValue, useEffect, useState } from "react";

import { routerBuilder } from "~features/routing/router";

export function NavigationProgress({
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
