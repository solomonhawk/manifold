import type { RouterOutput } from "@manifold/router";
import type { TableGetInputRaw } from "@manifold/validators";
import { useLocation } from "react-router-dom";

import { trpc } from "~utils/trpc";

export function useGetTable(input: TableGetInputRaw) {
  const location = useLocation();

  return trpc.table.get.useSuspenseQuery(input, {
    placeholderData: location.state?.table as RouterOutput["table"]["get"],
  });
}
