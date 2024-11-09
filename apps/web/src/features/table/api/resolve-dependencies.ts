import type { RouterOutput } from "@manifold/router";

import { trpc } from "~utils/trpc";

export function useResolveDependencies({
  dependencies,
  onSettled,
  onSuccess,
}: {
  dependencies: string[];
  enabled?: boolean;
  onSettled?: () => void;
  onSuccess?: (data: RouterOutput["table"]["resolveDependencies"]) => void;
}) {
  return trpc.table.resolveDependencies.useQuery(
    { dependencies },
    {
      enabled: false,
      onSuccess,
      onSettled,
    },
  );
}
