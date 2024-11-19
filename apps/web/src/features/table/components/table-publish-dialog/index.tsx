import { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
  DialogLoader,
} from "@manifold/ui/components/ui/dialog";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { TablePublishDialogProps } from "~features/table/components/table-publish-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const TablePublishDialogComponent = lazyPreload(
  () => import("./table-publish-dialog"),
);

export function TablePublishDialog(props: TablePublishDialogProps) {
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
          <TablePublishDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

TablePublishDialog.preload = TablePublishDialogComponent.preload;
