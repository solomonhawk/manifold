import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { toast } from "@manifold/ui/components/ui/toaster";
import { type MouseEvent, useDeferredValue } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";

import { trpc } from "~utils/trpc";

export function FavoriteButton({
  tableId,
  isFavorited,
}: {
  tableId: string;
  isFavorited: boolean;
}) {
  const trpcUtils = trpc.useUtils();
  const mutation = trpc.table.update.useMutation({
    onSuccess: async (data) => {
      toast.success(data.favorited ? "Added favorite" : "Removed favorite", {
        duration: 3000,
        dismissible: true,
      });

      trpcUtils.table.get.setData(tableId, data);

      // @TODO: this causes the dashboard loader to prefetch the table data again
      // which means we no longer see the animation of the item entering/leaving
      trpcUtils.table.favorites.invalidate();

      trpcUtils.table.get.invalidate(tableId, { refetchType: "inactive" });
    },
    onError: (e) => {
      toast.error("Failed to update favorite status", {
        description: e.message,
        dismissible: true,
        closeButton: true,
        important: true,
        duration: Infinity,
      });
    },
  });

  const isPending = useDeferredValue(mutation.isLoading);

  async function handleClick(e: MouseEvent) {
    e.preventDefault();

    try {
      await mutation.mutateAsync({ id: tableId, favorited: !isFavorited });
    } catch (e) {
      console.error(e);
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
