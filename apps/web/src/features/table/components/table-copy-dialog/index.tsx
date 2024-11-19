import { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
  DialogLoader,
} from "@manifold/ui/components/ui/dialog";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { TableCopyDialogProps } from "~features/table/components/table-copy-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const TableCopyDialogComponent = lazyPreload(
  () => import("./table-copy-dialog"),
);

export function TableCopyDialog(props: TableCopyDialogProps) {
  const dialog = useModal();
  const returnFocus = useReturnFocus(dialog.visible);

  return (
    <Dialog
      open={dialog.visible}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dialog.hide();
          returnFocus();
        }
      }}
    >
      <DialogContent
        className="w-auto max-w-full"
        onAnimationEnd={() => {
          if (!dialog.visible) {
            dialog.remove();
          }
        }}
      >
        <Suspense fallback={<DialogLoader />}>
          <TableCopyDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

TableCopyDialog.preload = TableCopyDialogComponent.preload;
