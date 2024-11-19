import { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
  DialogLoader,
} from "@manifold/ui/components/ui/dialog";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { TableEditMetadataDialogProps } from "~features/table/components/table-edit-metadata-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const TableEditMetadataDialogComponent = lazyPreload(
  () => import("./table-edit-metadata-dialog"),
);

export function TableEditMetadataDialog(props: TableEditMetadataDialogProps) {
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
          <TableEditMetadataDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

TableEditMetadataDialog.preload = TableEditMetadataDialogComponent.preload;
