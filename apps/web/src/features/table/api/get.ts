import { useLocation } from "react-router-dom";

import { trpc } from "~utils/trpc";

export type TableVersionSummary = {
  id: string;
  version: number;
  tableSlug: string;
  ownerId: string;
  createdAt: string;
  definition: string;
};

export function useGetTable({
  username,
  slug,
}: {
  username: string;
  slug: string;
}) {
  const location = useLocation();

  return trpc.table.get.useQuery(
    { username, slug },
    {
      placeholderData: location.state?.table,
    },
  );
}
