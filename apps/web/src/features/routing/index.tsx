import { createBrowserRouter } from "react-router-dom";

import { RootLayout } from "#features/routing/routes/root/layout.tsx";
import { rootLoader } from "#features/routing/routes/root/loader.ts";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      loader: rootLoader,
      children: [
        {
          index: true,
          lazy: () => import("./routes/dashboard/page"),
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
