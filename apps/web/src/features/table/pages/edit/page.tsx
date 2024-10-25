import { useParams } from "react-router-dom";

import { TableUpdateForm } from "~features/table/components/table-update-form";
import { RoutingError } from "~utils/errors";
import { trpc } from "~utils/trpc";

export function TableEdit() {
  const { id } = useParams();

  if (!id) {
    throw new RoutingError("No ID provided");
  }

  const query = trpc.table.get.useQuery(id);
  const trpcUtils = trpc.useUtils();

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  if (query.isSuccess && query.data) {
    const table = query.data;

    return (
      <div className="flex flex-col grow min-h-0 p-12 sm:p-16">
        <TableUpdateForm
          id={table.id}
          title={table.title}
          initialDefinition={table.definition}
          onUpdate={() =>
            Promise.all([
              trpcUtils.table.list.invalidate(),
              trpcUtils.table.get.invalidate(id),
            ])
          }
        />
      </div>
    );
  }

  return <div>Error: {query.error?.message}</div>;
}

export const Component = TableEdit;
