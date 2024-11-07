import { useLocation } from "react-router-dom";

import { trpc } from "~utils/trpc";

export function useTable({ id }: { id: string }) {
  const location = useLocation();

  return trpc.table.get.useQuery(id, {
    placeholderData: location.state?.table,
  });
}