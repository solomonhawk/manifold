import { createBrowserRouter } from "react-router-dom";

import { RootError } from "~features/routing/root/error";
import { RootLayout } from "~features/routing/root/layout";
import { rootLoader } from "~features/routing/root/loader";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      loader: rootLoader,
      errorElement: <RootError />,
      children: [
        {
          index: true,
          lazy: () => import("~features/dashboard/pages/root/page"),
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
