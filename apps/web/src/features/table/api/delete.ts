import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useNavigate } from "react-router-dom";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useDeleteTable({ title }: { title: string }) {
  const navigate = useNavigate();
  const trpcUtils = trpc.useUtils();

  return trpc.table.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcUtils.table.list.refetch(),
        trpcUtils.table.favorites.refetch(),
      ]);

      await navigate("/dashboard");

      toastSuccess(`${title} deleted`);
    },
    onError: (e) => {
      log.error(e);

      toastError("Failed to delete table", {
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
