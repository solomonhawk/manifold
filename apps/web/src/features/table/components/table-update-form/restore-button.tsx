import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { type MouseEvent } from "react";
import { GoIterations } from "react-icons/go";

import { useRestoreTable } from "~features/table/api/restore";

export function RestoreButton({
  title,
  tableIdentifier,
  tableId,
}: {
  title: string;
  tableIdentifier: string;
  tableId: string;
}) {
  const undeleteTableMutation = useRestoreTable({ title, tableIdentifier });

  const isPending = useStateGuard(undeleteTableMutation.isLoading, {
    min: 250,
  });

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    undeleteTableMutation.mutate({ id: tableId });
  }

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-8"
    >
      {isPending ? (
        <LoadingIndicator size="sm" className="-ml-4" />
      ) : (
        <GoIterations className="-ml-4 rotate-180" />
      )}{" "}
      Restore Table
    </Button>
  );
}
