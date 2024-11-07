import type { RouterOutput } from "@manifold/router";
import { toast } from "@manifold/ui/components/ui/toaster";
import { useRef } from "react";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useCreateTable({
  onSuccess,
}: {
  onSuccess?: (table: RouterOutput["table"]["create"]) => void;
}) {
  const trpcUtils = trpc.useUtils();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.table.create.useMutation({
    onSuccess: async (data) => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      toastSuccess("Table created");

      trpcUtils.table.list.invalidate();

      await onSuccess?.(data);
    },
    onError: (e) => {
      log.error(e);

      toastErrorId.current = toastError("Failed to create table", {
        description: e.message,
      });
    },
  });
}
