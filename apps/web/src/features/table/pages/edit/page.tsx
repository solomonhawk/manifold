import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { z } from "@manifold/validators";

import { useRouteParams } from "~features/routing/hooks/use-route-params";
import { useTable } from "~features/table/api/get";
import { TableUpdateForm } from "~features/table/components/table-update-form";
import { Header } from "~features/table/components/table-update-form/header";

export function TableEdit() {
  const { id } = useRouteParams({ id: z.string() });
  const tableQuery = useTable({ id });

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
