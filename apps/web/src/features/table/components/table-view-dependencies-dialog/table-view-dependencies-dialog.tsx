import { Button } from "@manifold/ui/components/core/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@manifold/ui/components/core/drawer";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { useCallback } from "react";
import { GoLinkExternal, GoX } from "react-icons/go";
import { useBlocker } from "react-router-dom";

import type { WithDialog } from "~features/dialog-manager/types";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteChange } from "~features/routing/hooks/use-route-change";
import type { TableViewDependenciesDialogProps } from "~features/table/components/table-view-dependencies-dialog/types";

export function TableViewDependenciesDialog({
  dialog,
  tableTitle,
  tableIdentifier,
  dependencies,
}: WithDialog<TableViewDependenciesDialogProps>) {
  /**
   * Prevent navigation when the modal is open
   */
  useBlocker(dialog.visible);

  /**
   * Close the modal when a route change would occur
   */
  useRouteChange(useCallback(() => dialog.hide(), [dialog]));

  return (
    <>
      <div className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-xl">
          <DrawerHeader>
            <DrawerTitle className="my-16 text-xl">
              Dependencies for{" "}
              <TableIdentifier tableIdentifier={tableIdentifier} />
            </DrawerTitle>

            <DrawerDescription>
              <strong className="text-foreground">“{tableTitle}”</strong>{" "}
              depends on{" "}
              <strong className="text-foreground">{dependencies.length}</strong>{" "}
              tables:
            </DrawerDescription>
          </DrawerHeader>

          <section className="px-16">
            <ul className="divide-y border">
              {dependencies.map((dependency) => {
                return (
                  <li key={dependency.id} className="flex justify-between p-12">
                    <PrefetchableLink
                      to={`/t/${dependency.ownerUsername}/${dependency.tableSlug}/v/${dependency.version}`}
                      target="_blank"
                      className="flex items-center gap-4"
                    >
                      <TableIdentifier
                        tableIdentifier={dependency.tableIdentifier}
                      />
                      <GoLinkExternal className="size-12" />
                    </PrefetchableLink>

                    <span>v{dependency.version}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <DrawerFooter>
            <Button
              onClick={() => {
                dialog.hide();
              }}
            >
              Dismiss
            </Button>
          </DrawerFooter>
        </div>
      </div>

      <DrawerClose asChild>
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-16 top-16"
        >
          <span className="sr-only">Dismiss drawer</span>
          <GoX />
        </Button>
      </DrawerClose>
    </>
  );
}

export default TableViewDependenciesDialog;
