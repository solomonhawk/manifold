import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { Link, type LinkProps, matchRoutes } from "react-router-dom";

import { routesAtom } from "~features/routing/state";

export type PrefetchBehavior = "visible" | "intent";

/**
 * @NOTE: Does not support following loader redirects and prefetching those
 * routes.
 */
export function PrefetchableLink({
  children,
  to,
  mode = "intent",
  ...props
}: LinkProps & {
  mode?: PrefetchBehavior;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const routes = useAtomValue(routesAtom);

  /**
   * @HACK: Until RR supports preloading/prefetching, this will have to do.
   */
  const runLoaders = useCallback(async () => {
    const nextMatches = matchRoutes(routes, to) ?? [];
    const path = typeof to === "string" ? to : to.pathname;

    if (!path) {
      return;
    }

    for (const match of nextMatches) {
      const lazy = match.route.lazy;

      if (lazy) {
        // @TODO: do we need to ignore certain exports here instead of spreading everything?
        match.route = { ...match.route, ...(await lazy()) };
      }

      const loader = match.route.loader;

      if (typeof loader === "function") {
        // @PERF: would be nice to do these in parallel
        await loader({
          request: new Request(new URL(path, window.location.origin)),
          params: match.params,
        });
      }
    }
  }, [routes, to]);

  const handleIntent = useCallback(() => {
    if (mode === "intent") {
      runLoaders();
    }
  }, [mode, runLoaders]);

  useEffect(() => {
    if (mode !== "visible") {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        requestIdleCallback(() => {
          runLoaders();
        });
      }
    });

    const currentTarget = ref.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [mode, runLoaders]);

  return (
    <Link
      ref={ref}
      to={to}
      {...props}
      onMouseEnter={handleIntent}
      onFocus={handleIntent}
    >
      {children}
    </Link>
  );
}
