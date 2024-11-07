import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { GoTrash } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsDeletingTable } from "~features/table/api/delete";

export function DeleteButton({
  title,
  tableId,
  slug,
}: {
  title: string;
  tableId: string;
  slug: string;
}) {
  const isDeleting = useIsDeletingTable();
  const isPending = useStateGuard(isDeleting, { min: 250 });

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   *
   * @TODO: only allow delete if not public or 0 tables depend on it
   */
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="destructive-outline"
          disabled={isPending}
          onClick={() =>
            DialogManager.show(DIALOGS.DELETE_TABLE.ID, {
              tableId,
              title,
              slug,
            })
          }
        >
          <span className="sr-only">Delete table</span>
          {isPending ? <LoadingIndicator size="sm" /> : <GoTrash />}
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        Delete Table
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
}
