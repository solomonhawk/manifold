import { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
  DialogLoader,
} from "@manifold/ui/components/ui/dialog";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { FindDependencyDialogProps } from "~features/engine/components/find-dependency-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const FindDependencyDialogComponent = lazyPreload(
  () => import("./find-dependency-dialog"),
);

export function FindDependencyDialog(props: FindDependencyDialogProps) {
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
        onEscapeKeyDown={(e) => {
          e.stopPropagation();
          dialog.hide();
        }}
      >
        <Suspense fallback={<DialogLoader />}>
          <FindDependencyDialogComponent {...props} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

FindDependencyDialog.preload = FindDependencyDialogComponent.preload;
