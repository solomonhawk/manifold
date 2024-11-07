import { toast } from "@manifold/ui/components/ui/toaster";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRef } from "react";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useDeleteTable({
  title,
  tableId,
  onSuccess,
}: {
  title: string;
  tableId: string;
  onSuccess?: () => void;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.table.delete.useMutation({
    onSuccess: async () => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      toastSuccess(`${title} deleted`);

      await Promise.all([
        trpcUtils.table.list.refetch(),
        trpcUtils.table.favorites.refetch(),
      ]);

      trpcUtils.table.get.invalidate({ id: tableId });

      await onSuccess?.();
    },
    onError: (e) => {
      log.error(e);

      toastErrorId.current = toastError("Failed to delete table", {
        description: e.message,
      });
    },
  });
}

export function useIsDeletingTable() {
  return (
    useIsMutating({
      mutationKey: getQueryKey(trpc.table.delete),
    }) > 0
  );
}
