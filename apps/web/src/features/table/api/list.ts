import type { TableListOrderBy } from "@manifold/validators";

import { trpc } from "~utils/trpc";

export function useListTables({ orderBy }: { orderBy: TableListOrderBy }) {
  return trpc.table.list.useQuery(
    { orderBy },
    {
      keepPreviousData: true,
    },
  );
}
