import type { RouterOutput } from "@manifold/router";
import { toast } from "@manifold/ui/components/ui/toaster";
import { useRef } from "react";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useUpdateTable({
  tableId,
  onSuccess,
}: {
  tableId: string;
  onSuccess: (data: RouterOutput["table"]["update"]) => void | Promise<void>;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.table.update.useMutation({
    onSuccess: async (data) => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      toastSuccess("Table updated");

      await onSuccess?.(data);

      // update query cache (list + get)
      trpcUtils.table.get.setData({ id: tableId }, data);
      trpcUtils.table.list.setData({}, (list) => {
        return list?.map((t) => (t.id === data.id ? data : t)) ?? [data];
      });

      // invalidate table list and favorites queries to ensure order is accurate (based on `updatedAt`)
      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();

      // invalidate get query, but don't bother refetching until the next time it becomes active
      trpcUtils.table.get.invalidate(
        { id: tableId },
        { refetchType: "inactive" },
      );
    },
    onError: (e) => {
      log.error(e);

      toastErrorId.current = toastError("Table failed to save", {
        description: e.message,
      });
    },
  });
}
