import { buildTableIdentifier } from "@manifold/lib";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { FlexCol } from "@manifold/ui/components/ui/flex";

import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { useGetTable } from "~features/table/api/get";
import { Header } from "~features/table/components/header";
import { TableUpdateForm } from "~features/table/components/table-update-form";
import { tableEditParams } from "~features/table/pages/edit/params";

export function TableEdit() {
  const { username, slug } = useRouteParams(tableEditParams);
  const tableQuery = useGetTable({
    tableIdentifier: buildTableIdentifier(username, slug),
  });

  // @TODO: replace with skeleton?
  if (tableQuery.isLoading) {
    return <FullScreenLoader />;
  }

  // @TODO: error state
  if (tableQuery.isError) {
    return <div>Error: {tableQuery.error?.message}</div>;
  }

  const table = tableQuery.data;

  return (
    <FlexCol className="space-y-16 p-12 sm:p-16">
      <Header table={table} />
      <TableUpdateForm
        table={table}
        isDisabled={tableQuery.isPlaceholderData}
      />
    </FlexCol>
  );
}
