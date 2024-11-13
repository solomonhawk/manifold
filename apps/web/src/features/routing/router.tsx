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
import { userIsOnboarded } from "~features/onboarding/helpers";
import { RootError } from "~features/routing/pages/root/error";
import { RootLayout } from "~features/routing/pages/root/layout";
import type { Handle } from "~features/routing/types";
import type { TableDetailLoaderData } from "~features/table/pages/detail";
import type { TableEditLoaderData } from "~features/table/pages/edit";
import type { TableVersionDetailLoaderData } from "~features/table-version/pages/detail";
import type { TableVersionsSearchBrowseLoaderData } from "~features/table-version/pages/search-browse";
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
          loader: guestLoader,
          lazy: () => import("~features/landing/pages/root/page"),
          handle: {
            title: () => "Manifold | Welcome",
            description: () =>
              "A tool for curating your collection of random tables.",
          } satisfies Handle,
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
              lazy: async () => {
                const { DashboardRoot, loaderBuilder } = await import(
                  "~features/dashboard/pages/root"
                );

                return {
                  loader: loaderBuilder(trpcUtils),
                  Component: DashboardRoot,
                };
              },
              handle: {
                title: () => "Manifold | Dashboard",
                description: () => "Where it all begins.",
              } satisfies Handle,
            },
          ],
        },
        {
          path: "t",
          loader: protectedLoader,
          errorElement: <RootError />,
          element: <AuthGuard />,
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
                  lazy: async () => {
                    const { TableDetail, loaderBuilder } = await import(
                      "~features/table/pages/detail"
                    );

                    return {
                      loader: loaderBuilder(trpcUtils),
                      Component: TableDetail,
                    };
                  },
                  handle: {
                    title: ({ data }) => `Manifold | ${data.title}`,
                    description: ({ data }) =>
                      data.description ?? `Details of ${data.title}.`,
                  } satisfies Handle<TableDetailLoaderData>,
                },
                {
                  path: "v/:version",
                  lazy: async () => {
                    const { TableVersionDetail, loaderBuilder } = await import(
                      "~features/table-version/pages/detail"
                    );

                    return {
                      loader: loaderBuilder(trpcUtils),
                      Component: TableVersionDetail,
                    };
                  },
                  handle: {
                    title: ({ data }) => `Manifold | ${data.table.title}`,
                    description: ({ data }) =>
                      data.table.description ??
                      `Details of ${data.table.title}.`,
                  } satisfies Handle<TableVersionDetailLoaderData>,
                },
                {
                  path: "edit",
                  lazy: async () => {
                    const { TableEdit, loaderBuilder } = await import(
                      "~features/table/pages/edit"
                    );

                    return {
                      loader: loaderBuilder(trpcUtils),
                      Component: TableEdit,
                    };
                  },
                  handle: {
                    title: ({ data }) => `Manifold | Edit ${data.title}`,
                    description: ({ data }) => `Edit ${data.title} table.`,
                  } satisfies Handle<TableEditLoaderData>,
                },
                {
                  index: true,
                  loader: () => redirect("edit"),
                },
              ],
            },
          ],
        },
        {
          path: "table",
          loader: protectedLoader,
          errorElement: <RootError />,
          element: <AuthGuard />,
          children: [
            {
              index: true,
              element: <Navigate to="/dashboard" replace />,
            },
            {
              path: "new",
              lazy: () => import("~features/table/pages/new/page"),
              handle: {
                title: () => "Manifold | New Table",
                description: () => "Create a new random table.",
              } satisfies Handle,
            },
            {
              path: "discover",
              lazy: async () => {
                const { TableVersionsSearchBrowse, loaderBuilder } =
                  await import("~features/table-version/pages/search-browse");

                return {
                  loader: loaderBuilder(trpcUtils),
                  Component: TableVersionsSearchBrowse,
                };
              },
              handle: {
                title: ({ data }) =>
                  `Manifold | Browse ${data.pagination.totalItems} Tables`,
                description: () =>
                  `Search and browse to discover exactly what you need.`,
              } satisfies Handle<TableVersionsSearchBrowseLoaderData>,
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
