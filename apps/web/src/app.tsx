import { SessionProvider } from "@manifold/auth/client";
import { TooltipProvider } from "@manifold/ui/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import { AuthWrapper } from "~features/auth/context/wrapper";
import { Router } from "~features/routing";
import { trpc, trpcClient } from "~utils/trpc";

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={300}>
            <AuthWrapper>
              <Router />
            </AuthWrapper>
          </TooltipProvider>

          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
