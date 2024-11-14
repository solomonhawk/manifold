import { useAtomValue } from "jotai";
import { useEffect } from "react";

import { routerAtom } from "~features/routing/state";

/**
 * Calls the provided callback when the route changes
 */
export function useRouteChange(callback: () => void) {
  const router = useAtomValue(routerAtom);

  useEffect(() => {
    return router?.subscribe(() => callback());
  }, [router, callback]);
}
