import { useModal } from "@ebay/nice-modal-react";
import type { RouterOutput } from "@manifold/router";
import { TableIdentifier } from "@manifold/ui/components/table-identifier";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@manifold/ui/components/ui/drawer";
import { useCallback } from "react";
import { GoLinkExternal, GoX } from "react-icons/go";
import { useBlocker } from "react-router-dom";

import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { useRouteChange } from "~features/routing/hooks/use-route-change";

type Props = {
  tableTitle: string;
  tableIdentifier: string;
  dependencies: RouterOutput["table"]["get"]["dependencies"];
};

export function TableViewDependenciesDialog({
  tableTitle,
  tableIdentifier,
  dependencies,
}: Props) {
  const modal = useModal();

  /**
   * Prevent navigation when the modal is open
   */
  useBlocker(modal.visible);

  /**
   * Close the modal when a route change would occur
   */
  useRouteChange(useCallback(() => modal.hide(), [modal]));

  return (
    <Drawer
      open={modal.visible}
      onClose={() => modal.hide()}
      onAnimationEnd={() => modal.remove()}
      shouldScaleBackground
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      <DrawerContent className="top-0">
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
                <strong className="text-foreground">
                  {dependencies.length}
                </strong>{" "}
                tables:
              </DrawerDescription>
            </DrawerHeader>

            <section className="px-16">
              <ul className="divide-y border">
                {dependencies.map((dependency) => {
                  return (
                    <li
                      key={dependency.id}
                      className="flex justify-between p-12"
                    >
                      <PrefetchableLink
                        to={{
                          pathname: `/t/${dependency.ownerUsername}/${dependency.tableSlug}/v/${dependency.version}`,
                        }}
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
                  modal.hide();
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
      </DrawerContent>
    </Drawer>
  );
}
