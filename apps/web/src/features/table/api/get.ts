import { useLocation } from "react-router-dom";

import { trpc } from "~utils/trpc";

export function useGetTable({ tableIdentifier }: { tableIdentifier: string }) {
  const location = useLocation();

  return trpc.table.get.useQuery(
    { tableIdentifier },
    {
      placeholderData: location.state?.table,
    },
  );
}
