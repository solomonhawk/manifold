import { buildTableIdentifier } from "@manifold/lib/utils/table-identifier";
import type { RouterOutput } from "@manifold/router";
import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

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
  const toastErrorInstance = useSingletonToast();

  return trpc.table.publish.useMutation({
    onSuccess: async (data) => {
      toastErrorInstance.dismiss();

      // invalidate get query
      await trpcUtils.table.get.invalidate({
        tableIdentifier: data.tableIdentifier,
      });

      trpcUtils.tableVersion.list.invalidate();

      await onSuccess?.(data);

      toastSuccess(
        `${buildTableIdentifier(userProfile.username, slug)} v${data.version} published`,
      );
    },
    onError: (e) => {
      toastErrorInstance.update(
        toastError("Failed to publish", {
          description: e.message,
        }),
      );
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
