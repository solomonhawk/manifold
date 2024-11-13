import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { useAtomValue } from "jotai";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { Link, type LinkProps, matchRoutes } from "react-router-dom";

import { routesAtom } from "~features/routing/state";
import { log } from "~utils/logger";

type PrefetchableLinkProps = LinkProps &
  (
    | {
        mode?: "visible";
        wait?: never;
      }
    | {
        mode?: "intent";
        wait?: number;
      }
  );

/**
 * @NOTE: Does not support following loader redirects and prefetching those
 * routes.
 */
export const PrefetchableLink = forwardRef<
  HTMLAnchorElement,
  PrefetchableLinkProps
>(({ children, to, mode = "intent", wait = 250, ...props }, ref) => {
  if (import.meta.env.DEV && wait < 0) {
    log.warn("PrefecthableLink: `wait` must be a positive number");
  }

  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const combinedRef = useComposedRefs(ref, linkRef);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

    const promises = [];

    for (const match of nextMatches) {
      /**
       * If the route has a `lazy` definition, call it to load the lazy route
       * definition. That definition may include a loader, but may not.
       *
       * If it doesn't, just use the matched route's existing loader, if present.
       */
      const lazyLoadRoute =
        match.route.lazy ??
        (() => Promise.resolve({ loader: match.route.loader }));

      promises.push(
        lazyLoadRoute()
          .then((module) => {
            const loader = module.loader ?? match.route.loader;

            if (typeof loader !== "function") {
              return;
            }

            return loader({
              request: new Request(new URL(path, window.location.origin)),
              params: match.params,
            });
          })
          .catch((e) => log.error(e)),
      );
    }

    return Promise.all(promises);
  }, [routes, to]);

  const handleIntent = useCallback(() => {
    if (mode === "intent") {
      if (wait > 0) {
        const timeoutId = setTimeout(runLoaders, wait);
        timeoutRef.current = timeoutId;
      } else {
        runLoaders();
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }

    return;
  }, [mode, runLoaders, wait]);

  const handleUnintent = useCallback(() => {
    if (mode === "intent" && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [mode]);

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

    const currentTarget = linkRef.current;

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
      to={to}
      ref={combinedRef}
      {...props}
      onMouseEnter={handleIntent}
      onMouseLeave={handleUnintent}
      onFocus={handleIntent}
      onBlur={handleUnintent}
    >
      {children}
    </Link>
  );
});
PrefetchableLink.displayName = "PrefetchableLink";
