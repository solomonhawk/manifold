import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { GoTrash } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsDeletingTable } from "~features/table/api/delete";

export function DeleteButton({
  title,
  tableId,
}: {
  title: string;
  tableId: string;
}) {
  const isDeleting = useIsDeletingTable();
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
