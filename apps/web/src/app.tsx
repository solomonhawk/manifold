import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { Editor } from "./features/editor";
import { trpc, trpcClient } from "./utils/trpc";

export function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col h-full">
          <Editor />
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
