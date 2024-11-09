import type { RouterOutput } from "@manifold/router";
import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useUpdateTable({
  slug,
  onSuccess,
}: {
  slug: string;
  onSuccess: (data: RouterOutput["table"]["update"]) => void | Promise<void>;
}) {
  const userProfile = useRequiredUserProfile();
  const trpcUtils = trpc.useUtils();
  const toastErrorInstance = useSingletonToast();

  return trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toastErrorInstance.dismiss();

      await onSuccess?.(data);

      // update query cache (list + get)
      // @ ts-expect-error - account for table dependencies after update
      trpcUtils.table.get.setData(
        {
          username: userProfile.username,
          slug,
        },
        (existing) => {
          if (!existing) {
            return existing;
          }

          // @NOTE: we don't re-query `recentVersions` and `totalVersionCount`
          // but we don't expect them to have changed
          return { ...existing, ...data };
        },
      );

      trpcUtils.table.list.setData({}, (list) => {
        return list?.map((t) => (t.id === data.id ? data : t)) ?? [data];
      });

      // invalidate table list and favorites queries to ensure order is accurate (based on `updatedAt`)
      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();

      // invalidate get query, but don't bother refetching until the next time it becomes active
      trpcUtils.table.get.invalidate(
        {
          username: userProfile.username,
          slug,
        },
        { refetchType: "inactive" },
      );

      toastSuccess("Table updated");
    },
    onError: (e) => {
      toastErrorInstance.update(
        toastError("Table failed to save", {
          description: e.message,
        }),
      );
    },
  });
}
