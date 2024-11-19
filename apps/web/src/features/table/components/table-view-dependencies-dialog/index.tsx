import { useModal } from "@ebay/nice-modal-react";
import {
  Drawer,
  DrawerContent,
  DrawerLoader,
} from "@manifold/ui/components/ui/drawer";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import { Suspense } from "react";

import type { TableViewDependenciesDialogProps } from "~features/table/components/table-view-dependencies-dialog/types";
import lazyPreload from "~utils/lazy-preload";

const TableViewDependenciesDialogComponent = lazyPreload(
  () => import("./table-view-dependencies-dialog"),
);

export function TableViewDependenciesDialog(
  props: TableViewDependenciesDialogProps,
) {
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
          <TableViewDependenciesDialogComponent {...props} dialog={dialog} />
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
}

TableViewDependenciesDialog.preload =
  TableViewDependenciesDialogComponent.preload;
