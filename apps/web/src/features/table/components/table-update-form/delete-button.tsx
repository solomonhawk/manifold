import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { GoTrash } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsDeletingTable } from "~features/table/api/delete";

export function DeleteButton({
  title,
  tableId,
  tableIdentifier,
}: {
  title: string;
  tableId: string;
  tableIdentifier: string;
}) {
  const isDeleting = useIsDeletingTable();
  const isPending = useStateGuard(isDeleting, { min: 250 });

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive-outline"
      disabled={isPending}
      onClick={() =>
        DialogManager.show(DIALOGS.DELETE_TABLE.ID, {
          tableId,
          title,
          tableIdentifier,
        })
      }
      className="w-full justify-start"
    >
      {isPending ? <LoadingIndicator size="sm" /> : <GoTrash />}
      Delete table
    </Button>
  );
}
