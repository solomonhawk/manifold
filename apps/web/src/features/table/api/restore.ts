import { toast } from "@manifold/ui/components/ui/toaster";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRef } from "react";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useRestoreTable({
  title,
  tableId,
}: {
  title: string;
  tableId: string;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.table.restore.useMutation({
    onSuccess: async () => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      // lazily invalidate table list and favorites queries to ensure order is accurate (based on `updatedAt`)
      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();

      // invalidate get query immediately
      await trpcUtils.table.get.invalidate(tableId);

      toastSuccess(`${title} restored`);
    },
    onError: (e) => {
      log.error(e);

      toastErrorId.current = toastError("Failed to restore table", {
        description: e.message,
      });
    },
  });
}

export function useIsRestoringTable() {
  return (
    useIsMutating({
      mutationKey: getQueryKey(trpc.table.restore),
    }) > 0
  );
}
