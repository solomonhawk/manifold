import { useModal } from "@ebay/nice-modal-react";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@manifold/ui/components/ui/alert-dialog";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { type MouseEvent } from "react";

import { useDeleteTable } from "~features/table/api/delete";

type Props = {
  title: string;
  tableId: string;
  slug: string;
};

export const TableDeleteDialog = ({ title, tableId, slug }: Props) => {
  const modal = useModal();
  const returnFocus = useReturnFocus(modal.visible);
  const mutation = useDeleteTable({
    title,
    slug,
    onSuccess: () => {
      mutation.reset();
      modal.hide();
    },
  });

  const isPending = useStateGuard(mutation.isLoading, { min: 250 });

  function handleConfirmDelete(e: MouseEvent) {
    e.preventDefault();
    mutation.mutate({ id: tableId });
  }

  return (
    <AlertDialog
      open={modal.visible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          modal.hide();
          returnFocus();
        }
      }}
    >
      <AlertDialogContent className="gap-24">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Fear not, deleted tables can be recovered at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Nevermind</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirmDelete}
            className="flex items-center gap-6"
            disabled={isPending}
          >
            {isPending && <LoadingIndicator size="sm" className="-ml-4" />}{" "}
            Delete Table
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
