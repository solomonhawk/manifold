import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthGuard } from "~features/auth/components/auth-guard";
import { GuestGuard } from "~features/auth/components/guest-guard";
import { RootError } from "~features/routing/root/error";
import { RootLayout } from "~features/routing/root/layout";
import { rootLoader } from "~features/routing/root/loader";
import type { TrpcUtils } from "~utils/trpc";

export const routerBuilder = (trpcUtils: TrpcUtils) => {
  return createBrowserRouter(
    [
      {
        path: "/",
        element: <RootLayout />,
        loader: rootLoader,
        errorElement: <RootError />,
        children: [
          {
            element: <GuestGuard />,
            children: [
              {
                index: true,
                lazy: () => import("~features/landing/pages/root/page"),
              },
              {
                path: "/login",
                lazy: () => import("~features/auth/pages/login/page"),
              },
            ],
          },
          {
            element: <AuthGuard />,
            children: [
              {
                path: "dashboard",
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
              {
                path: "table",
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
                        element: <Navigate to="edit" replace />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: "*",
            lazy: () => import("~features/routing/root/not-found"),
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
