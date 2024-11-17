import type { RouterOutput } from "@manifold/router";
import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useListTableFavorites() {
  return trpc.table.favorites.useSuspenseQuery();
}

export function useFavoriteTable({
  tableIdentifier,
  onSuccess,
}: {
  tableIdentifier: string;
  onSuccess?: (data: RouterOutput["table"]["update"]) => void;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorInstance = useSingletonToast();

  return trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toastErrorInstance.dismiss();

      await onSuccess?.(data);

      // @ ts-expect-error - account for table dependencies after favorite
      trpcUtils.table.get.setData({ tableIdentifier }, (existing) => {
        if (!existing) {
          return existing;
        }

        // @NOTE: we don't re-query `recentVersions` and `totalVersionCount`
        // but we don't expect them to have changed
        return { ...existing, ...data };
      });

      // @TODO: this causes the dashboard loader to prefetch the table data again
      // which means we no longer see the animation of the item entering/leaving
      trpcUtils.table.favorites.invalidate();

      trpcUtils.table.get.invalidate(
        { tableIdentifier },
        { refetchType: "inactive" },
      );

      toastSuccess(data.favorited ? "Added favorite" : "Removed favorite");
    },
    onError: (e) => {
      log.error(e);

      toastErrorInstance.update(
        toastError("Failed to update favorite status", {
          description: e.message,
        }),
      );
    },
  });
}
