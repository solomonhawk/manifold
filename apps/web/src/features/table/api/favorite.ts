import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useListTableFavorites() {
  return trpc.table.favorites.useQuery();
}

export function useFavoriteTable({
  tableId,
  onSuccess,
}: {
  tableId: string;
  onSuccess?: () => void;
}) {
  const trpcUtils = trpc.useUtils();

  return trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toastSuccess(data.favorited ? "Added favorite" : "Removed favorite");

      await onSuccess?.();

      trpcUtils.table.get.setData(tableId, data);

      // @TODO: this causes the dashboard loader to prefetch the table data again
      // which means we no longer see the animation of the item entering/leaving
      trpcUtils.table.favorites.invalidate();

      trpcUtils.table.get.invalidate(tableId, { refetchType: "inactive" });
    },
    onError: (e) => {
      log.error(e);

      toastError("Failed to update favorite status", {
        description: e.message,
      });
    },
  });
}
