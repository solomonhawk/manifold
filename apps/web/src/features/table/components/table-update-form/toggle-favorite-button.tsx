import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { toast } from "@manifold/ui/components/ui/toaster";
import { isError } from "@tanstack/react-query";
import { type MouseEvent, useDeferredValue } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";

import { trpc } from "~utils/trpc";

export function ToggleFavoriteButton({
  tableId,
  isFavorited,
}: {
  tableId: string;
  isFavorited: boolean;
}) {
  const trpcUtils = trpc.useUtils();
  const mutation = trpc.table.update.useMutation({
    onSuccess: async () => {
      trpcUtils.table.favorites.invalidate();
      await trpcUtils.table.get.refetch(tableId);
    },
  });

  const isPending = useDeferredValue(mutation.isLoading);

  async function handleClick(e: MouseEvent) {
    e.preventDefault();

    try {
      await mutation.mutateAsync({
        id: tableId,
        favorited: !isFavorited,
      });

      toast.success(isFavorited ? "Removed favorite" : "Added favorite", {
        duration: 3000,
        dismissible: true,
      });
    } catch (e) {
      console.error(e);

      toast.error("Failed to update favorite status", {
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
    <Button
      size="icon"
      onClick={handleClick}
      variant="outline"
      disabled={isPending}
    >
      {isPending ? (
        <LoadingIndicator size="sm" />
      ) : isFavorited ? (
        <GoHeartFill />
      ) : (
        <GoHeart />
      )}
    </Button>
  );
}
