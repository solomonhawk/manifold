import type { RouterOutput } from "@manifold/router";

import { trpc } from "~utils/trpc";

export function useFindDependencies({
  tableIdentifier,
  searchQuery,
  onSettled,
  onSuccess,
}: {
  tableIdentifier: string;
  searchQuery: string;
  onSettled?: () => void;
  onSuccess?: (data: RouterOutput["table"]["findDependencies"]) => void;
}) {
  return trpc.table.findDependencies.useQuery(
    { searchQuery },
    {
      enabled: searchQuery.length > 0,
      keepPreviousData: true,
      onSuccess,
      onSettled,
      select: (data) =>
        data.filter((d) => d.tableIdentifier !== tableIdentifier),
    },
  );
}
