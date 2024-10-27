import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { useLocation, useParams } from "react-router-dom";

import { TableUpdateForm } from "~features/table/components/table-update-form";
import { RoutingError } from "~utils/errors";
import { trpc } from "~utils/trpc";

export function TableEdit() {
  const { id } = useParams();
  const location = useLocation();

  if (!id) {
    throw new RoutingError("No ID provided");
  }

  const tableQuery = trpc.table.get.useQuery(id, {
    placeholderData: location.state?.table,
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
    <FlexCol className="p-12 sm:p-16">
      <TableUpdateForm
        table={table}
        isDisabled={tableQuery.isPlaceholderData}
      />
    </FlexCol>
  );
}
