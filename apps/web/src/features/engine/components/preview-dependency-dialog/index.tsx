import { useModal } from "@ebay/nice-modal-react";
import { injectNamespacePragmasWorkaround } from "@manifold/lib";
import type { RouterOutput } from "@manifold/router";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
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
import { GoX } from "react-icons/go";
import { useBlocker } from "react-router-dom";

import RollPreview from "~features/engine/components/roll-preview";
import { useRouteChange } from "~features/routing/hooks/use-route-change";

type Props = {
  dependency: RouterOutput["table"]["findDependencies"][number];
  onAddDependency: () => void;
  canAddDependency: boolean;
};

export function PreviewDependencyDialog({
  dependency,
  onAddDependency,
  canAddDependency,
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
              <DrawerTitle className="my-16">
                <TableIdentifier tableIdentifier={dependency.tableIdentifier} />
              </DrawerTitle>

              <DrawerDescription className="sr-only">
                {dependency.table?.description || "No table description"}
              </DrawerDescription>
            </DrawerHeader>

            <section className="px-16">
              <dl className="mb-16 grid grid-cols-[min-content,_1fr] border-l border-t text-sm">
                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Description
                </dt>
                <dd className="border-b border-r px-10 py-8">
                  {dependency.table?.description || (
                    <em className="text-muted-foreground">
                      No table description
                    </em>
                  )}
                </dd>

                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Last&nbsp;updated
                </dt>
                <dd className="border-b border-r px-10 py-8">
                  {dependency.createdAt.toLocaleDateString()}
                </dd>

                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Version
                </dt>
                <dd className="border-b border-r px-10 py-8">
                  {dependency.version}
                </dd>

                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Release&nbsp;notes
                </dt>
                <dd className="border-b border-r px-10 py-8">
                  {dependency.releaseNotes || (
                    <em className="text-muted-foreground">No release notes</em>
                  )}
                </dd>
                <dt className="border-b border-r px-10 py-8 font-semibold text-muted-foreground">
                  Available&nbsp;Tables
                </dt>
                <dd className="flex flex-wrap gap-4 border-b border-r px-10 py-8">
                  {dependency.availableTables.map((tableId) => (
                    <code
                      key={tableId}
                      className="rounded bg-secondary p-3 px-6 text-xs leading-none text-accent-foreground"
                    >
                      {tableId}
                    </code>
                  ))}
                </dd>
              </dl>

              <div className="rounded border">
                <pre className="max-h-256 overflow-auto px-16 py-12 text-xs leading-tight">
                  {dependency.definition}
                </pre>
              </div>
            </section>

            <section className="p-16">
              <RollPreview
                layoutRoot
                definition={injectNamespacePragmasWorkaround(
                  dependency.definition,
                  dependency.dependencies,
                )}
              />
            </section>

            <DrawerFooter>
              <ReactiveButton
                onClick={() => {
                  modal.hide();
                  onAddDependency();
                }}
                disabled={!canAddDependency}
              >
                {canAddDependency
                  ? "Add this dependency"
                  : "Dependency already added"}
              </ReactiveButton>
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
