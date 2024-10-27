import { useSession } from "@manifold/auth/client";
import {
  createBrowserRouter,
  type LoaderFunctionArgs,
  redirect,
} from "react-router-dom";

import { RootError } from "~features/routing/pages/root/error";
import { RootLayout } from "~features/routing/pages/root/layout";
import type { TrpcUtils } from "~utils/trpc";

function guestLoaderBuilder(auth: ReturnType<typeof useSession>) {
  return async () => {
    if (auth.status === "authenticated") {
      return redirect("/dashboard");
    }

    return null;
  };
}

function protectedLoaderBuilder(auth: ReturnType<typeof useSession>) {
  return async ({ request }: LoaderFunctionArgs) => {
    if (auth.status === "unauthenticated") {
      const params = new URLSearchParams();
      params.set("from", new URL(request.url).pathname);
      return redirect(`/?${params.toString()}`);
    }

    return null;
  };
}

export const routerBuilder = (
  trpcUtils: TrpcUtils,
  auth: ReturnType<typeof useSession>,
) => {
  const guestLoader = guestLoaderBuilder(auth);
  const protectedLoader = protectedLoaderBuilder(auth);

  return createBrowserRouter(
    [
      {
        path: "/",
        element: <RootLayout />,
        errorElement: <RootError />,
        children: [
          {
            index: true,
            loader: guestLoader,
            lazy: () => import("~features/landing/pages/root/page"),
          },
          {
            path: "login",
            loader: guestLoader,
            lazy: () => import("~features/auth/pages/login/page"),
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
    ],
    {
      future: {
        v7_skipActionErrorRevalidation: true,
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
      },
    },
  );
};
