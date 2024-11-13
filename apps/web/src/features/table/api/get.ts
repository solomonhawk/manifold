import type { TableGetInputRaw } from "@manifold/validators";
import { useLocation } from "react-router-dom";

import { trpc } from "~utils/trpc";

export function useGetTable(input: TableGetInputRaw) {
  const location = useLocation();

  return trpc.table.get.useQuery(input, {
    placeholderData: location.state?.table,
  });
}
