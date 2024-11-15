import { useModal } from "@ebay/nice-modal-react";
import type { RouterOutput } from "@manifold/router";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@manifold/ui/components/ui/select";
import { useReturnFocus } from "@manifold/ui/hooks/use-return-focus";
import type { Change, WordsOptions } from "diff";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { GoArrowSwitch, GoDash, GoGitCompare, GoX } from "react-icons/go";
import { useBlocker } from "react-router-dom";

import { useRouteChange } from "~features/routing/hooks/use-route-change";

type Props = {
  versions: RouterOutput["tableVersion"]["get"]["versions"];
  table: RouterOutput["tableVersion"]["get"]["table"];
  currentVersion?: number;
};

// @NOTE: @types/diff is pretty poorly designed
type DiffModule = {
  diffWords: (
    oldStr: string,
    newStr: string,
    options?: WordsOptions,
  ) => Change[];
};

function getInitialVersions(
  versions: Props["versions"],
  currentVersion?: number,
) {
  // default current to the most recent version
  const current = currentVersion ?? versions[0].version;

  // if it's the most recent version, compare it to the previous version
  if (current === versions[0].version) {
    return {
      from: versions[1].version,
      to: current,
    };
  }

  // otherwise compare the current version to the most recent version
  return {
    from: current,
    to: versions[0].version,
  };
}

export function CompareVersionsDialog({
  versions,
  table,
  currentVersion,
}: Props) {
  const modal = useModal();
  const [diff, setDiff] = useState<DiffModule | null>(null);
  const returnFocus = useReturnFocus(modal.visible);
  const [{ from, to }] = useState(() =>
    getInitialVersions(versions, currentVersion),
  );
  const [fromVersionNumber, setFromVersionNumber] = useState(String(from));
  const [toVersionNumber, setToVersionNumber] = useState(String(to));

  const versionsMap = useMemo(() => {
    return Object.fromEntries(versions.map((v) => [v.version, v]));
  }, [versions]);

  const sourceVersion = versionsMap[fromVersionNumber];
  const targetVersion = versionsMap[toVersionNumber];

  /**
   * Prevent navigation when the modal is open
   */
  useBlocker(modal.visible);

  /**
   * Close the modal when a route change would occur
   */
  useRouteChange(useCallback(() => modal.hide(), [modal]));

  /**
   * Lazy load the diff library
   */
  useEffect(() => {
    async function resolveDiff() {
      const module = await import("diff");
      setDiff(module);
    }

    if (!diff) {
      resolveDiff();
    }
  }, [modal, diff]);

  const diffElements = useMemo(() => {
    if (diff) {
      const computedDiff = diff.diffWords(
        sourceVersion.definition,
        targetVersion.definition,
      );

      return computedDiff.map((part, index) => {
        return (
          <Fragment key={index}>
            {part.added ? (
              <span className="text-accent-foreground">{part.value}</span>
            ) : part.removed ? (
              <span className="text-destructive">{part.value}</span>
            ) : (
              <span className="text-muted-foreground">{part.value}</span>
            )}
          </Fragment>
        );
      });
    }

    return [];
  }, [diff, sourceVersion, targetVersion]);

  return (
    <Drawer
      open={modal.visible}
      onClose={() => {
        modal.hide();
        returnFocus();
      }}
      onAnimationEnd={() => modal.remove()}
      shouldScaleBackground
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
    >
      <DrawerContent className="top-0">
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

        <div className="w-full flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-screen-xl">
            <DrawerHeader>
              <DrawerTitle className="my-16" asChild>
                <h3 className="text-xl">
                  Comparing versions of{" "}
                  <TableIdentifier tableIdentifier={table.tableIdentifier} />
                </h3>
              </DrawerTitle>

              <DrawerDescription className="sr-only">
                Compare versions of table {table.title}
              </DrawerDescription>
            </DrawerHeader>

            <section className="flex flex-col gap-16 px-16">
              <div className="flex items-center gap-8">
                <GoGitCompare className="shrink-0" />
                <VersionSelect
                  value={fromVersionNumber}
                  onValueChange={setFromVersionNumber}
                  versions={versions}
                  versionsMap={versionsMap}
                />
                <GoDash className="shrink-0 text-muted-foreground" />
                <VersionSelect
                  value={toVersionNumber}
                  onValueChange={setToVersionNumber}
                  versions={versions}
                  versionsMap={versionsMap}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setFromVersionNumber(toVersionNumber);
                    setToVersionNumber(fromVersionNumber);
                  }}
                >
                  <span className="sr-only">Swap versions</span>
                  <GoArrowSwitch />
                </Button>
              </div>

              {!diff ? (
                <FullScreenLoader className="py-48" />
              ) : (
                <div className="grid grid-cols-2 gap-16 text-sm">
                  <div>
                    <h4 className="mb-12 font-bold">
                      Version {sourceVersion.version}
                    </h4>
                    <pre className="overflow-auto rounded-sm border p-16 text-muted-foreground">
                      {sourceVersion.definition}
                    </pre>
                  </div>

                  <div>
                    <h4 className="mb-12 font-bold">
                      Version {targetVersion.version}
                    </h4>
                    <pre className="overflow-auto rounded-sm border p-16">
                      {diffElements}
                    </pre>
                  </div>
                </div>
              )}
            </section>

            <DrawerFooter>
              <div className="flex justify-center">
                <Button
                  className="min-w-256"
                  onClick={() => modal.hide()}
                  variant="outline"
                >
                  Dismiss
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function VersionSelect({
  value,
  onValueChange,
  versions,
  versionsMap,
}: {
  value: string;
  onValueChange: (value: string) => void;
  versions: RouterOutput["tableVersion"]["get"]["versions"];
  versionsMap: Record<
    string,
    RouterOutput["tableVersion"]["get"]["versions"][number]
  >;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="max-w-256">
        <strong>
          v{value}{" "}
          <span className="font-normal text-muted-foreground">
            ({versionsMap[value]?.createdAt.toLocaleDateString()})
          </span>
        </strong>
      </SelectTrigger>

      <SelectContent>
        {versions.map((v) => {
          return (
            <SelectItem key={v.version} value={String(v.version)}>
              v{v.version}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
