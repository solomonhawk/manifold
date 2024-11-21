import { useModal } from "@ebay/nice-modal-react";
import {
  Drawer,
  DrawerContent,
  DrawerLoader,
} from "@manifold/ui/components/core/drawer";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { PreviewDependencyDialogProps } from "~features/engine/components/preview-dependency-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const PreviewDependencyDialogComponent = lazyPreload(
  () => import("./preview-dependency-dialog"),
);

export function PreviewDependencyDialog(props: PreviewDependencyDialogProps) {
  const dialog = useModal();
  const returnFocus = useReturnFocus(dialog.visible);

  return (
    <Drawer
      open={dialog.visible}
      onClose={() => {
        dialog.hide();
        returnFocus();
      }}
      onAnimationEnd={() => dialog.remove()}
      shouldScaleBackground
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      <DrawerContent className="top-0">
        <Suspense fallback={<DrawerLoader />}>
          <PreviewDependencyDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
}

PreviewDependencyDialog.preload = PreviewDependencyDialogComponent.preload;
