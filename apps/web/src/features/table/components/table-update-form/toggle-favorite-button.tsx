import { Button } from "@manifold/ui/components/ui/button";
import { toast } from "@manifold/ui/components/ui/toaster";
import { isError } from "@tanstack/react-query";
import type { MouseEvent } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";

import { trpc } from "~utils/trpc";

export function ToggleFavoriteButton({
  tableId,
  isFavorited,
}: {
  tableId: string;
  isFavorited: boolean;
}) {
  const mutation = trpc.table.update.useMutation();
  const trpcUtils = trpc.useUtils();

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

      trpcUtils.table.get.invalidate();
      trpcUtils.table.favorites.invalidate();
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

  return (
    <Button size="icon" onClick={handleClick} variant="outline">
      {isFavorited ? <GoHeartFill /> : <GoHeart />}
    </Button>
  );
}
