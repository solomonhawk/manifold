import { SessionProvider } from "@manifold/auth/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "~features/routing";
import { trpc, trpcClient } from "~utils/trpc";

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
