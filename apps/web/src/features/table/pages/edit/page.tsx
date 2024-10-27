import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
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

  const query = trpc.table.get.useQuery(id, {
    placeholderData: location.state?.table,
  });

  const trpcUtils = trpc.useUtils();

  if (query.isLoading) {
    // @TODO: replace with skeleton
    return (
      <FlexCol className="items-center justify-center">
        <LoadingIndicator />
      </FlexCol>
    );
  }

  if (query.isSuccess && query.data) {
    const table = query.data;

    return (
      <FlexCol className="p-12 sm:p-16">
        <TableUpdateForm
          table={table}
          isDisabled={query.isPlaceholderData}
          onUpdate={() =>
            Promise.all([
              trpcUtils.table.list.refetch(),
              trpcUtils.table.get.refetch(id),
            ])
          }
        />
      </FlexCol>
    );
  }

  return <div>Error: {query.error?.message}</div>;
}
