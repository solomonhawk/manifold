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
import { GoPackageDependents } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsPublishingTable } from "~features/table/api/publish";

export type PublishButtonProps = {
  slug: string;
  isEnabled: boolean;
  // @TODO: fix this type
  recentVersions: TableVersionSummary[];
  totalVersionCount: number;
};

export function PublishButton({
  slug,
  isEnabled,
  recentVersions,
  totalVersionCount,
}: PublishButtonProps) {
  const isPublishing = useIsPublishingTable();
  const isPending = useStateGuard(isPublishing, { min: 250 });
  const canPublish = !isPending && isEnabled;

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
                tableSlug: slug,
                recentVersions,
                totalVersionCount,
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
