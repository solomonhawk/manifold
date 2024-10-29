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
import { type MouseEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { log } from "~utils/logger";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

type Props = {
  tableId: string;
  title: string;
};

export const TableDeleteDialog = ({ tableId, title }: Props) => {
  const modal = useModal();
  const navigate = useNavigate();
  const trpcUtils = trpc.useUtils();
  const returnFocus = useReturnFocus(modal.visible);

  const mutation = trpc.table.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        trpcUtils.table.list.refetch(),
        trpcUtils.table.favorites.refetch(),
      ]);

      await navigate("/dashboard");

      toastSuccess(`${title} deleted`);
    },
    onError: (e) => {
      log.error(e);

      toastError("Failed to delete table", {
        description: e.message,
      });
    },
  });

  const isPending = useStateGuard(mutation.isLoading, { min: 250 });

  async function handleConfirmDelete(e: MouseEvent) {
    e.preventDefault();
    mutation.mutate(tableId);
  }

  /**
   * @NOTE: We do the navigate in an effect instead of the mutation `onSuccess`
   * so we can defer it until after the guard timeout has elapsed to avoid a
   * flash of the loading indicator.
   */
  useEffect(() => {
    if (!isPending && modal.visible && mutation.isSuccess) {
      mutation.reset();
      modal.hide();
    }
  }, [isPending, mutation, modal]);

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
      <AlertDialogContent>
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
