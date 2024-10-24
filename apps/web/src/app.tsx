import { SessionProvider } from "@manifold/auth/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "#features/routing/index.tsx";
import { trpc, trpcClient } from "#utils/trpc.ts";

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {/* <div className="flex flex-col h-full">
            <AuthTest />
            <Editor />
          </div> */}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
