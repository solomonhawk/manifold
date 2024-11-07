import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { type MouseEvent, useEffect, useRef } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";

import { useFavoriteTable } from "~features/table/api/favorite";

export function FavoriteButton({
  slug,
  tableId,
  isFavorite,
}: {
  slug: string;
  tableId: string;
  isFavorite: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const favoriteTableMutation = useFavoriteTable({ slug });

  const isPending = useStateGuard(favoriteTableMutation.isLoading, {
    min: 250,
  });

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    favoriteTableMutation.mutate({ id: tableId, favorited: !isFavorite });
  }

  useEffect(() => {
    if (!isPending && favoriteTableMutation.isSuccess) {
      favoriteTableMutation.reset();
      buttonRef.current?.focus();
    }
  }, [favoriteTableMutation, isPending]);

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={buttonRef}
          size="icon"
          onClick={handleClick}
          variant="outline"
          disabled={isPending}
        >
          <span className="sr-only">
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </span>

          {isPending ? (
            <LoadingIndicator size="sm" />
          ) : isFavorite ? (
            <GoHeartFill />
          ) : (
            <GoHeart />
          )}
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        {isFavorite ? "Remove from favorites" : "Add to favorites"}
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
}
