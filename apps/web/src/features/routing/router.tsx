import { useSession } from "@manifold/auth/client";
import {
  createBrowserRouter,
  type LoaderFunction,
  type LoaderFunctionArgs,
  Navigate,
  redirect,
  type RouteObject,
} from "react-router-dom";

import { AuthGuard } from "~features/auth/components/auth-guard";
import { loadDashboardRoute } from "~features/dashboard/pages/root/lazy";
import { loadLandingRoute } from "~features/landing/pages/root/lazy";
import { userIsOnboarded } from "~features/onboarding/helpers";
import { RootError } from "~features/routing/pages/root/error";
import { RootLayout } from "~features/routing/pages/root/layout";
import type { Handle } from "~features/routing/types";
import { loadTableDetailRoute } from "~features/table/pages/detail/lazy";
import { loadTableEditRoute } from "~features/table/pages/edit/lazy";
import { loadTableNewRoute } from "~features/table/pages/new/lazy";
import { loadTableVersionDetailRoute } from "~features/table-version/pages/detail/lazy";
import { loadTableVersionSearchBrowseRoute } from "~features/table-version/pages/search-browse/lazy";
import type { TrpcUtils } from "~utils/trpc";

export function buildAppRoutes({
  trpcUtils,
  guestLoader,
  protectedLoader,
}: {
  trpcUtils: TrpcUtils;
  guestLoader: LoaderFunction;
  protectedLoader: LoaderFunction;
}) {
  return [
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <RootError />,
      children: [
        {
          index: true,
          lazy: loadLandingRoute(guestLoader, trpcUtils),
        },
        {
          path: "login",
          loader: guestLoader,
          lazy: () => import("~features/auth/pages/login/page"),
          handle: {
            title: () => "Manifold | Login",
            description: () => "Sign in to access your Manifolds.",
          } satisfies Handle,
        },
        {
          path: "onboarding",
          loader: protectedLoader,
          errorElement: <RootError />,
          element: <AuthGuard />,
          children: [
            {
              index: true,
              element: <Navigate to="/dashboard" replace />,
            },
            {
              path: "new-user",
              lazy: () =>
                import("~features/onboarding/pages/create-profile/page"),
              handle: {
                title: () => "Manifold | Create Profile",
                description: () => "Create your user profile to get started.",
              } satisfies Handle,
            },
          ],
        },
        {
          path: "dashboard",
          loader: protectedLoader,
          errorElement: <RootError />,
          element: <AuthGuard />,
          children: [
            {
              index: true,
              lazy: loadDashboardRoute(trpcUtils),
            },
          ],
        },
        {
          path: "t",
          errorElement: <RootError />,
          children: [
            {
              index: true,
              element: <Navigate to="/dashboard" replace />,
            },
            {
              path: ":username/:slug",
              children: [
                {
                  index: true,
                  lazy: loadTableDetailRoute(trpcUtils),
                },
                {
                  path: "v/:version",
                  lazy: loadTableVersionDetailRoute(trpcUtils),
                  children: [
                    {
                      index: true,
                      lazy: () =>
                        import("~features/table-version/pages/detail").then(
                          (mod) => ({
                            Component: mod.TableVersionDetail,
                          }),
                        ),
                    },
                  ],
                },
                {
                  path: "*",
                  element: <AuthGuard />,
                  loader: protectedLoader,
                  children: [
                    {
                      path: "edit",
                      lazy: loadTableEditRoute(trpcUtils),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: "table",
          errorElement: <RootError />,
          children: [
            {
              index: true,
              element: <Navigate to="/dashboard" replace />,
            },
            {
              path: "discover",
              lazy: loadTableVersionSearchBrowseRoute(trpcUtils),
            },
            {
              path: "*",
              element: <AuthGuard />,
              loader: protectedLoader,
              children: [
                {
                  path: "new",
                  lazy: loadTableNewRoute(),
                },
              ],
            },
          ],
        },
        {
          path: "tech-stack",
          lazy: () => import("~features/made-with/pages/root/page"),
          handle: {
            title: () => "Manifold | Tech Stack",
            description: () =>
              "The tools and technologies that power Manifold.",
          } satisfies Handle,
        },
        {
          path: "*",
          lazy: () => import("~features/routing/pages/root/not-found"),
          handle: {
            title: () => "Manifold | Not Found",
            description: () => "You have found an empty room.",
          } satisfies Handle,
        },
      ],
    },
  ] satisfies RouteObject[];
}

export function guestLoaderBuilder(auth: ReturnType<typeof useSession>) {
  return async () => {
    if (auth.status === "authenticated") {
      return redirect("/dashboard");
    }

    return null;
  };
}

export function protectedLoaderBuilder(auth: ReturnType<typeof useSession>) {
  return async ({ request }: LoaderFunctionArgs) => {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);

    if (auth.status === "unauthenticated") {
      return redirect(`/?${params.toString()}`);
    }

    if (auth.status === "authenticated") {
      const isOnboarded = userIsOnboarded(auth);

      if (!isOnboarded && !request.url.includes("/onboarding/new-user")) {
        return redirect(`/onboarding/new-user?${params.toString()}`);
      }

      if (isOnboarded && request.url.includes("/onboarding")) {
        return redirect("/dashboard");
      }
    }

    // @TODO: should this wait for auth to be not loading?
    return null;
  };
}

export const routerBuilder = (routes: RouteObject[]) => {
  return createBrowserRouter(routes, {
    future: {
      v7_skipActionErrorRevalidation: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
    },
  });
};
