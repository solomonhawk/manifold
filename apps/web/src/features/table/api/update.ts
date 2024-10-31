import type { TableModel } from "@manifold/db/schema/table";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useUpdateTable({
  tableId,
  onSuccess,
}: {
  tableId: string;
  onSuccess: (data: TableModel) => void | Promise<void>;
}) {
  const trpcUtils = trpc.useUtils();

  return trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toastSuccess("Table updated");

      await onSuccess?.(data);

      // update query cache (list + get)
      trpcUtils.table.get.setData(tableId, data);
      trpcUtils.table.list.setData(undefined, (list) => {
        return list?.map((t) => (t.id === data.id ? data : t)) ?? [data];
      });

      // invalidate table list and favorites queries to ensure order is accurate (based on `updatedAt`)
      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();

      // invalidate get query, but don't bother refetching until the next time it becomes active
      trpcUtils.table.get.invalidate(tableId, { refetchType: "inactive" });
    },
    onError: (e) => {
      log.error(e);

      toastError("Table failed to save", {
        description: e.message,
      });
    },
  });
}
