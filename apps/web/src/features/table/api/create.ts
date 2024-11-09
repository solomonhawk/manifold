import type { RouterOutput } from "@manifold/router";
import { useSingletonToast } from "@manifold/ui/hooks/use-singleton-toast";

import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useCreateTable({
  onSuccess,
}: {
  onSuccess?: (table: RouterOutput["table"]["create"]) => void;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorInstance = useSingletonToast();

  return trpc.table.create.useMutation({
    onSuccess: async (data) => {
      toastErrorInstance.dismiss();

      trpcUtils.table.list.invalidate();

      await onSuccess?.(data);

      toastSuccess("Table created");
    },
    onError: (e) => {
      toastErrorInstance.update(
        toastError("Failed to create table", {
          description: e.message,
        }),
      );
    },
  });
}
