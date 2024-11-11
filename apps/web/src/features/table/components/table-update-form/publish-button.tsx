import type { TableVersionSummary } from "@manifold/db";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { useAtomValue } from "jotai";
import { GoPackageDependents } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { currentAllResolvedDependenciesAtom } from "~features/editor/components/editor/state";
import { useIsPublishingTable } from "~features/table/api/publish";

export type PublishButtonProps = {
  tableId: string;
  tableSlug: string;
  isEnabled: boolean;
  // @TODO: fix this type
  recentVersions: TableVersionSummary[];
  totalVersionCount: number;
};

export function PublishButton({
  tableId,
  tableSlug,
  isEnabled,
  recentVersions,
  totalVersionCount,
}: PublishButtonProps) {
  const isPublishing = useIsPublishingTable();
  const isPending = useStateGuard(isPublishing, { min: 250 });
  const canPublish = !isPending && isEnabled;

  /**
   * Users may only publish a saved version of a table therefore using
   * `currentAllResolvedDependenciesAtom` is safe here. This atom has _at least_
   * all of the dependencies that the saved table depends on and possible more
   * if the user has added new dependencies since the last save. If the user has
   * removed dependencies since the last save, then this atom may have
   * extraneous dependencies.
   */
  const currentResolvedDependencies = useAtomValue(
    currentAllResolvedDependenciesAtom,
  );

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* @ref https://www.radix-vue.com/components/tooltip#displaying-a-tooltip-from-a-disabled-button */}
        {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
        <span tabIndex={canPublish ? undefined : 0}>
          <ReactiveButton
            className="flex items-center gap-8"
            disabled={!canPublish}
            onClick={() =>
              DialogManager.show(DIALOGS.PUBLISH_TABLE.ID, {
                tableId,
                tableSlug,
                recentVersions,
                totalVersionCount,
                dependencies: currentResolvedDependencies.map((d) => ({
                  dependencyIdentifier: d.tableIdentifier,
                  dependencyVersion: d.version,
                })),
              })
            }
          >
            {isPending ? (
              <LoadingIndicator size="sm" />
            ) : (
              <GoPackageDependents />
            )}
            Publish{recentVersions.length > 0 ? " Version" : null}
          </ReactiveButton>
        </span>
      </TooltipTrigger>

      {!canPublish && (
        <TooltipContent>
          Save new changes to publish a new version.
          <TooltipArrow />
        </TooltipContent>
      )}
    </Tooltip>
  );
}
