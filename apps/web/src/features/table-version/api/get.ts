import { buildTableIdentifier } from "@manifold/lib";

import { trpc } from "~utils/trpc";

export function useGetTableVersion({
  username,
  slug,
  version,
}: {
  username: string;
  slug: string;
  version: number;
}) {
  return trpc.tableVersion.get.useSuspenseQuery({
    tableIdentifier: buildTableIdentifier(username, slug),
    version,
  });
}
