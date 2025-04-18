import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useRestoreTable({
  title,
  tableIdentifier,
}: {
  title: string;
  tableIdentifier: string;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorInstance = useSingletonToast();

  return trpc.table.restore.useMutation({
    onSuccess: async () => {
      toastErrorInstance.dismiss();

      // lazily invalidate table list and favorites queries to ensure order is accurate (based on `updatedAt`)
      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();

      // invalidate get query immediately
      await trpcUtils.table.get.invalidate({
        tableIdentifier,
      });

      toastSuccess(`${title} restored`);
    },
    onError: (e) => {
      log.error(e);

      toastErrorInstance.update(
        toastError("Failed to restore table", {
          description: e.message,
        }),
      );
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
