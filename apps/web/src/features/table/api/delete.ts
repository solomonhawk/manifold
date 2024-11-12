import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useDeleteTable({
  title,
  tableIdentifier,
  onSuccess,
}: {
  title: string;
  tableIdentifier: string;
  onSuccess?: () => void;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorInstance = useSingletonToast();

  return trpc.table.delete.useMutation({
    onSuccess: async () => {
      toastErrorInstance.dismiss();

      await Promise.all([
        trpcUtils.table.list.refetch(),
        trpcUtils.table.favorites.refetch(),
      ]);

      trpcUtils.table.get.invalidate({ tableIdentifier });

      await onSuccess?.();

      toastSuccess(`${title} deleted`);
    },
    onError: (e) => {
      log.error(e);

      toastErrorInstance.update(
        toastError("Failed to delete table", {
          description: e.message,
        }),
      );
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
