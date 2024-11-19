import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@manifold/ui/components/ui/alert-dialog";
import {
  Notice,
  NoticeContent,
  NoticeIcon,
} from "@manifold/ui/components/ui/notice";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { type MouseEvent } from "react";
import { GoInfo } from "react-icons/go";

import type { WithDialog } from "~features/dialog-manager/types";
import { useDeleteTable } from "~features/table/api/delete";
import type { TableDeleteDialogProps } from "~features/table/components/table-delete-dialog/types";

export function TableDeleteDialogComponent({
  dialog,
  title,
  tableId,
  tableIdentifier,
}: WithDialog<TableDeleteDialogProps>) {
  const mutation = useDeleteTable({
    title,
    tableIdentifier,
    onSuccess: () => {
      mutation.reset();
      dialog.hide();
    },
  });

  const isPending = useStateGuard(mutation.isLoading, { min: 250 });

  function handleConfirmDelete(e: MouseEvent) {
    e.preventDefault();
    mutation.mutate({ id: tableId });
  }

  return (
    <div className="space-y-24 sm:w-dialog-sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
        <AlertDialogDescription>
          Fear not, deleted tables can be recovered at any time.
        </AlertDialogDescription>

        <Notice variant="loud" className="!mt-24">
          <NoticeIcon>
            <GoInfo className="size-18" />
          </NoticeIcon>

          <NoticeContent className="space-y-12 leading-snug">
            Any published versions of{" "}
            <TableIdentifier tableIdentifier={tableIdentifier} /> will remain
            publicly available.
          </NoticeContent>
        </Notice>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>Nevermind</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={handleConfirmDelete}
          className="flex items-center gap-6"
          disabled={isPending}
        >
          {isPending && <LoadingIndicator size="sm" className="-ml-4" />} Delete
          Table
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  );
}

export default TableDeleteDialogComponent;
