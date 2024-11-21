import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";
import { FlexCol } from "@manifold/ui/components/core/flex";

import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { useGetTable } from "~features/table/api/get";
import { TableUpdateForm } from "~features/table/components/table-update-form";
import { tableEditParams } from "~features/table/pages/edit/params";

export function TableEdit() {
  const { username, slug } = useRouteParams(tableEditParams);
  const [table, tableQuery] = useGetTable({
    tableIdentifier: buildTableIdentifier(username, slug),
  });

  return (
    <FlexCol className="p-12 sm:p-16">
      <TableUpdateForm
        table={table}
        isDisabled={tableQuery.isPlaceholderData}
      />
    </FlexCol>
  );
}
