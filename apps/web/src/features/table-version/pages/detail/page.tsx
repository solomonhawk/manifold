import { buildTableIdentifier } from "@manifold/lib";

import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { tableVersionDetailParams } from "~features/table-version/pages/detail/params";
import { trpc } from "~utils/trpc";

export function TableVersionDetail() {
  const { username, slug } = useRouteParams(tableVersionDetailParams);
  const data = trpc.tableVersion.get.useQuery({
    tableIdentifier: buildTableIdentifier(username, slug),
  });

  console.log(data.data);

  return <div>TableVersionDetail</div>;
}
