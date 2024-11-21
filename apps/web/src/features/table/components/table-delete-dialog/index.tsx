import { useModal } from "@ebay/nice-modal-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogLoader,
} from "@manifold/ui/components/core/alert-dialog";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { TableDeleteDialogProps } from "~features/table/components/table-delete-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const TableDeleteDialogComponent = lazyPreload(
  () => import("./table-delete-dialog"),
);

export function TableDeleteDialog(props: TableDeleteDialogProps) {
  const dialog = useModal();
  const returnFocus = useReturnFocus(dialog.visible);

  return (
    <AlertDialog
      open={dialog.visible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dialog.hide();
          returnFocus();
        }
      }}
    >
      <AlertDialogContent
        className="w-auto max-w-full"
        onAnimationEnd={() => {
          if (!dialog.visible) {
            dialog.remove();
          }
        }}
      >
        <Suspense fallback={<AlertDialogLoader />}>
          <TableDeleteDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </AlertDialogContent>
    </AlertDialog>
  );
}

TableDeleteDialog.preload = TableDeleteDialogComponent.preload;
