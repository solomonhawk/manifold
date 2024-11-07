import { toast } from "@manifold/ui/components/ui/toaster";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRef } from "react";

import { useRequiredUserProfile } from "~features/onboarding/hooks/use-required-user-profile";
import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useDeleteTable({
  title,
  slug,
  onSuccess,
}: {
  title: string;
  slug: string;
  onSuccess?: () => void;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);
  const userProfile = useRequiredUserProfile();

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

      trpcUtils.table.get.invalidate({ username: userProfile.username, slug });

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
