import type { RouterInput } from "@manifold/router";

import { trpc } from "~utils/trpc";

export function useListPrefetchedTables({
  orderBy,
  includeDeleted,
  options,
}: RouterInput["table"]["list"] & {
  options?: { enabled?: boolean };
}) {
  return trpc.table.list.useSuspenseQuery(
    { orderBy, includeDeleted },
    {
      keepPreviousData: true,
      ...options,
    },
  );
}

export function useListTables({
  orderBy,
  includeDeleted,
  options,
}: RouterInput["table"]["list"] & {
  options?: { enabled?: boolean };
}) {
  return trpc.table.list.useQuery(
    { orderBy, includeDeleted },
    {
      keepPreviousData: true,
      ...options,
    },
  );
}
