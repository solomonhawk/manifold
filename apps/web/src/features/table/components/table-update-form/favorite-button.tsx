import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { type MouseEvent, useDeferredValue } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";

import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function FavoriteButton({
  tableId,
  isFavorite,
}: {
  tableId: string;
  isFavorite: boolean;
}) {
  const trpcUtils = trpc.useUtils();
  const mutation = trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toastSuccess(data.favorited ? "Added favorite" : "Removed favorite");

      trpcUtils.table.get.setData(tableId, data);

      // @TODO: this causes the dashboard loader to prefetch the table data again
      // which means we no longer see the animation of the item entering/leaving
      trpcUtils.table.favorites.invalidate();

      trpcUtils.table.get.invalidate(tableId, { refetchType: "inactive" });
    },
    onError: (e) => {
      console.error(e);

      toastError("Failed to update favorite status", {
        description: e.message,
      });
    },
  });

  const isPending = useDeferredValue(mutation.isLoading);

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    mutation.mutate({ id: tableId, favorited: !isFavorite });
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
      ) : isFavorite ? (
        <GoHeartFill />
      ) : (
        <GoHeart />
      )}
    </Button>
  );
}
