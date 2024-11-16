import type { RouterOutput } from "@manifold/router";
import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";

import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useCopyTable({
  onSuccess,
}: {
  onSuccess?: (table: RouterOutput["table"]["copy"]) => void;
} = {}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorInstance = useSingletonToast();

  return trpc.table.copy.useMutation({
    onSuccess: async (data) => {
      toastErrorInstance.dismiss();

      trpcUtils.table.list.invalidate();

      await onSuccess?.(data);

      toastSuccess("Table copied");
    },
    onError: (e) => {
      toastErrorInstance.update(
        toastError("Failed to copy table", {
          description: e.message,
        }),
      );
    },
  });
}
