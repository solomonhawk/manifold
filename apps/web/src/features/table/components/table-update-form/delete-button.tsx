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
import { toast } from "@manifold/ui/components/ui/toaster";
import { isError } from "@tanstack/react-query";
import { type MouseEvent, useDeferredValue, useState } from "react";
import { GoTrash } from "react-icons/go";
import { useNavigate } from "react-router-dom";

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
      trpcUtils.table.list.invalidate();
      trpcUtils.table.favorites.invalidate();

      await navigate("/dashboard");
    },
  });

  const isPending = useDeferredValue(mutation.isLoading);

  async function handleClick(e: MouseEvent) {
    e.preventDefault();

    try {
      await mutation.mutateAsync(tableId);

      toast.success(`${title} deleted`, {
        duration: 3000,
        dismissible: true,
      });
    } catch (e) {
      console.error(e);

      toast.error("Failed to delete table", {
        description: isError(e) ? e.message : "An unknown error occurred",
        dismissible: true,
        closeButton: true,
        important: true,
        duration: Infinity,
      });
    }
  }

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
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
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Deleted tables can be recovered at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Nevermind</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleClick}>
            Delete Table
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
