import type { RouterOutput } from "@manifold/router";
import { toast } from "@manifold/ui/components/ui/toaster";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRef } from "react";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function usePublishTable({
  slug,
  onSuccess,
}: {
  slug: string;
  onSuccess?: (data: RouterOutput["table"]["publish"]) => void | Promise<void>;
}) {
  const userProfile = useRequiredUserProfile();
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.table.publish.useMutation({
    onSuccess: async (data) => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      // invalidate get query
      await trpcUtils.table.get.invalidate({
        username: userProfile.username,
        slug,
      });

      await onSuccess?.(data);

      toastSuccess(
        `@${userProfile.username}/${slug} v${data.version} published`,
      );
    },
    onError: (e) => {
      toastErrorId.current = toastError("Failed to publish", {
        description: e.message,
      });
    },
  });
}

export function useIsPublishingTable() {
  return (
    useIsMutating({
      mutationKey: getQueryKey(trpc.table.publish),
    }) > 0
  );
}
