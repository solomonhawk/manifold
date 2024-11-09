import { SessionProvider } from "@manifold/auth/client";
import { Toaster } from "@manifold/ui/components/ui/toaster";
import { TooltipProvider } from "@manifold/ui/components/ui/tooltip";
import { cn } from "@manifold/ui/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

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
    <SessionProvider refetchOnWindowFocus={true}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={300}>
            <Router />
          </TooltipProvider>

          <Toaster
            cn={cn}
            position="top-center"
            offset={4}
            visibleToasts={1}
            pauseWhenPageIsHidden
          />
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
