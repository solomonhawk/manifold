import { useSession } from "@manifold/auth/client";
import {
  createBrowserRouter,
  type LoaderFunction,
  type LoaderFunctionArgs,
  redirect,
  type RouteObject,
} from "react-router-dom";

import { RootError } from "~features/routing/pages/root/error";
import { RootLayout } from "~features/routing/pages/root/layout";
import type { Handle } from "~features/routing/types";
import type { TableEditLoaderData } from "~features/table/pages/edit";
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
          path: "dashboard",
          loader: protectedLoader,
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
          path: "table",
          loader: protectedLoader,
          children: [
            {
              path: "new",
              lazy: () => import("~features/table/pages/new/page"),
              handle: {
                title: () => "Manifold | New Table",
                description: () => "Create a new random table.",
              } satisfies Handle,
            },
            {
              path: ":id",
              children: [
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
    if (auth.status === "unauthenticated") {
      const params = new URLSearchParams();
      params.set("from", new URL(request.url).pathname);
      return redirect(`/?${params.toString()}`);
    }

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
