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
  AlertDialogTrigger,
} from "@manifold/ui/components/ui/alert-dialog";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { type MouseEvent, useEffect, useState } from "react";
import { GoTrash } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function DeleteButton({
  title,
  tableId,
}: {
  title: string;
  tableId: string;
}) {
  const navigate = useNavigate();
  const trpcUtils = trpc.useUtils();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const mutation = trpc.table.delete.useMutation({
    onSuccess: async () => {
      toastSuccess(`${title} deleted`);

      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();
    },
    onError: (e) => {
      console.error(e);

      toastError("Failed to delete table", {
        description: e.message,
      });
    },
  });

  const isPending = useStateGuard(mutation.isLoading, { min: 250 });

  /**
   * @NOTE: We do the navigate in an effect instead of the mutation `onSuccess`
   * so we can defer it until after the guard timeout has elapsed to avoid a
   * flash of the loading indicator.
   *
   * @TODO: This causes the dialog close animation not to play properly, which
   * we should probably fix.
   */
  useEffect(() => {
    if (!isPending && mutation.isSuccess) {
      navigate("/dashboard");
    }
  }, [mutation, navigate, isPending]);

  function handleConfirmDelete(e: MouseEvent) {
    e.preventDefault();
    mutation.mutate(tableId);
  }

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <AlertDialog
      open={isConfirmingDelete || isPending}
      onOpenChange={setIsConfirmingDelete}
    >
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          onClick={() => setIsConfirmingDelete(true)}
          variant="destructive-outline"
          disabled={isPending}
        >
          {isPending ? <LoadingIndicator size="sm" /> : <GoTrash />}
        </Button>
      </AlertDialogTrigger>

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
}
