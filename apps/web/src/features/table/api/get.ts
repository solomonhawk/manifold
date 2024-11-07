import { useLocation } from "react-router-dom";

import { trpc } from "~utils/trpc";

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
