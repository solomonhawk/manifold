import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { GoPencil } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsUpdatingTable } from "~features/table/api/update";

export function EditButton({
  tableId,
  tableIdentifier,
  title,
  description,
}: {
  tableId: string;
  tableIdentifier: string;
  title: string;
  description: string | null;
}) {
  const isUpdating = useIsUpdatingTable();
  const isPending = useStateGuard(isUpdating, { min: 250 });

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() =>
        DialogManager.show(DIALOGS.EDIT_TABLE_METADATA.ID, {
          tableId,
          tableIdentifier,
          title,
          description,
        })
      }
      className="w-full justify-start"
    >
      {isPending ? <LoadingIndicator size="sm" /> : <GoPencil />}
      Edit metadata
    </Button>
  );
}
