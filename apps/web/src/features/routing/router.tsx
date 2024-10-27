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

export function buildAppRoutes({
  trpcUtils,
  guestLoader,
  protectedLoader,
}: {
  trpcUtils: TrpcUtils;
  guestLoader?: LoaderFunction;
  protectedLoader?: LoaderFunction;
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
          } satisfies Handle,
        },
        {
          path: "login",
          loader: guestLoader,
          lazy: () => import("~features/auth/pages/login/page"),
          handle: {
            title: () => "Manifold | Login",
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
          path: "*",
          lazy: () => import("~features/routing/pages/root/not-found"),
        },
      ],
    },
  ];
}
