import { compose } from "@manifold/lib/utils/fn";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { Button } from "@manifold/ui/components/ui/button";
import { useStateGuard } from "@manifold/ui/hooks/use-state-guard";
import { cn } from "@manifold/ui/lib/utils";
import { forwardRef } from "react";
import { GoPencil } from "react-icons/go";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useIsUpdatingTable } from "~features/table/api/update";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tableId: string;
  tableIdentifier: string;
  title: string;
  description: string | null;
}

export const EditButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      tableId,
      tableIdentifier,
      title,
      description,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isUpdating = useIsUpdatingTable();
    const isPending = useStateGuard(isUpdating, { min: 250 });

    const { onClick, onFocus, onMouseEnter } = DialogManager.dialogButtonProps(
      DIALOGS.EDIT_TABLE_METADATA.ID,
      {
        tableId,
        tableIdentifier,
        title,
        description,
      },
    );

    return (
      <Button
        ref={ref}
        type="button"
        size="sm"
        variant="ghost"
        {...props}
        disabled={isPending || disabled}
        className={cn(className, "justify-start")}
        onClick={compose(onClick, props.onClick)}
        onFocus={compose(onFocus, props.onFocus)}
        onMouseEnter={compose(onMouseEnter, props.onMouseEnter)}
      >
        {isPending ? <LoadingIndicator size="sm" /> : <GoPencil />}
        Edit metadata
      </Button>
    );
  },
);

EditButton.displayName = "EditButton";
