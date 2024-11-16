import type { RouterOutput } from "@manifold/router";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { GoPackageDependencies } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";

export function ViewDependenciesButton({
  tableTitle,
  tableIdentifier,
  dependencies,
}: {
  tableTitle: string;
  tableIdentifier: string;
  dependencies: RouterOutput["table"]["get"]["dependencies"];
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          onClick={() => {
            DialogManager.show(DIALOGS.VIEW_TABLE_DEPENDENCIES.ID, {
              tableTitle,
              tableIdentifier,
              dependencies,
            });
          }}
          variant="outline"
        >
          <span className="sr-only">View dependencies</span>

          <GoPackageDependencies />
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        View dependencies
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
}
