import { SessionProvider } from "@manifold/auth/client";
import { Toaster } from "@manifold/ui/components/ui/toaster";
import { TooltipProvider } from "@manifold/ui/components/ui/tooltip";
import { cn } from "@manifold/ui/lib/utils";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Router } from "~features/routing";
import { createIDBPersister } from "~utils/indexeddb-persister";
import { trpc, trpcClient } from "~utils/trpc";

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5, // 5 minutes
            networkMode: "offlineFirst",
          },
        },
      }),
  );

  return (
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: createIDBPersister("manifold") }}
          >
            <TooltipProvider delayDuration={300}>
              <Router />
            </TooltipProvider>

            {createPortal(
              <Toaster
                cn={cn}
                position="top-center"
                offset={4}
                visibleToasts={1}
                pauseWhenPageIsHidden
              />,
              document.body,
            )}
            <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
          </PersistQueryClientProvider>
        </trpc.Provider>
      </SessionProvider>
    </MotionConfig>
  );
}
