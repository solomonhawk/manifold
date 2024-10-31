import type { TableModel } from "@manifold/db/schema/table";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useCreateTable({
  onSuccess,
}: {
  onSuccess?: (table: TableModel) => void;
}) {
  const trpcUtils = trpc.useUtils();

  return trpc.table.create.useMutation({
    onSuccess: async (data) => {
      toastSuccess("Table created");

      trpcUtils.table.list.invalidate();

      await onSuccess?.(data);
    },
    onError: (e) => {
      log.error(e);

      toastError("Failed to create table", {
        description: e.message,
      });
    },
  });
}
