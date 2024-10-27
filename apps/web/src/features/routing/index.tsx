import { useSession } from "@manifold/auth/client";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";

import { NavigationProgress } from "~features/routing/components/navigation-progress";
import { routerBuilder } from "~features/routing/router";
import { trpc } from "~utils/trpc";

export function Router() {
  const auth = useSession();
  const trpcUtils = trpc.useUtils();

  const routerInstance = useMemo(
    () => routerBuilder(trpcUtils, auth),
    [trpcUtils, auth],
  );

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
