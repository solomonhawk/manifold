import { compose } from "@manifold/lib/utils/fn";
import { Button } from "@manifold/ui/components/core/button";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { cn } from "@manifold/ui/lib/utils";
import { forwardRef } from "react";
import { GoTrash } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsDeletingTable } from "~features/table/api/delete";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  tableId: string;
  tableIdentifier: string;
}

export const DeleteButton = forwardRef<HTMLButtonElement, Props>(
  ({ title, tableId, tableIdentifier, className, disabled, ...props }, ref) => {
    const isDeleting = useIsDeletingTable();
    const isPending = useStateGuard(isDeleting, { min: 250 });

    const { onClick, onFocus, onMouseEnter } = DialogManager.dialogButtonProps(
      DIALOGS.DELETE_TABLE.ID,
      {
        tableId,
        title,
        tableIdentifier,
      },
    );

    return (
      <Button
        ref={ref}
        type="button"
        size="sm"
        variant="destructive-outline"
        {...props}
        disabled={disabled || isPending}
        className={cn(className, "grow justify-start")}
        onClick={compose(onClick, props.onClick)}
        onFocus={compose(onFocus, props.onFocus)}
        onMouseEnter={compose(onMouseEnter, props.onMouseEnter)}
      >
        {isPending ? <LoadingIndicator size="sm" /> : <GoTrash />}
        Delete table
      </Button>
    );
  },
);

DeleteButton.displayName = "DeleteButton";
