import { useModal } from "@ebay/nice-modal-react";
import {
  Drawer,
  DrawerContent,
  DrawerLoader,
} from "@manifold/ui/components/core/drawer";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { CompareVersionsDialogProps } from "~features/table-version/components/compare-versions-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const CompareVersionsDialogComponent = lazyPreload(
  () => import("./compare-versions-dialog"),
);

export function CompareVersionsDialog(props: CompareVersionsDialogProps) {
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
          <CompareVersionsDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
}

CompareVersionsDialog.preload = CompareVersionsDialogComponent.preload;
