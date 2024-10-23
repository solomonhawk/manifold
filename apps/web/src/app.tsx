import { SessionProvider } from "@manifold/auth/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AuthTest } from "~/auth-test";

import { trpc, trpcClient } from "./utils/trpc";

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col h-full">
            <AuthTest />
          </div>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
