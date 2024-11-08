import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { ReactiveButton } from "@manifold/ui/components/reactive-button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { GoPackageDependents } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import type { TableVersionSummary } from "~features/table/api/get";
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

  /**
   * @TODO: change this to <form onSubmit={..} /> and use a submit button. Can't
   * right now because it's nested inside the update form.
   */
  return (
    <ReactiveButton
      type="button"
      disabled={isPending || !isEnabled}
      onClick={() =>
        DialogManager.show(DIALOGS.PUBLISH_TABLE.ID, {
          tableSlug: slug,
          recentVersions,
          totalVersionCount,
        })
      }
      className="flex items-center gap-8"
    >
      {isPending ? <LoadingIndicator size="sm" /> : <GoPackageDependents />}
      Publish{recentVersions.length > 0 ? " Version" : null}
    </ReactiveButton>
  );
}
