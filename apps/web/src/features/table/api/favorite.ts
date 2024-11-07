import type { RouterOutput } from "@manifold/router";
import { toast } from "@manifold/ui/components/ui/toaster";
import { useRef } from "react";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useListTableFavorites() {
  return trpc.table.favorites.useQuery();
}

export function useFavoriteTable({
  slug,
  onSuccess,
}: {
  slug: string;
  onSuccess?: (data: RouterOutput["table"]["update"]) => void;
}) {
  const userProfile = useRequiredUserProfile();
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.table.update.useMutation({
    onSuccess: async (data) => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      toastSuccess(data.favorited ? "Added favorite" : "Removed favorite");

      await onSuccess?.(data);

      trpcUtils.table.get.setData(
        { username: userProfile.username, slug },
        data,
      );

      // @TODO: this causes the dashboard loader to prefetch the table data again
      // which means we no longer see the animation of the item entering/leaving
      trpcUtils.table.favorites.invalidate();

      trpcUtils.table.get.invalidate(
        { username: userProfile.username, slug },
        { refetchType: "inactive" },
      );
    },
    onError: (e) => {
      log.error(e);

      toastErrorId.current = toastError("Failed to update favorite status", {
        description: e.message,
      });
    },
  });
}
