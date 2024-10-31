import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { useIsMutating } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { GoTrash } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { trpc } from "~utils/trpc";

export function DeleteButton({
  title,
  tableId,
}: {
  title: string;
  tableId: string;
}) {
  const isDeleting =
    useIsMutating({
      mutationKey: getQueryKey(trpc.table.delete),
    }) > 0;
  const isPending = useStateGuard(isDeleting, { min: 250 });

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <Button
      type="button"
      size="icon"
      variant="destructive-outline"
      disabled={isPending}
      onClick={() =>
        DialogManager.show(DIALOGS.DELETE_TABLE.ID, {
          tableId,
          title,
        })
      }
    >
      <span className="sr-only">Delete table</span>
      {isPending ? <LoadingIndicator size="sm" /> : <GoTrash />}
    </Button>
  );
}
