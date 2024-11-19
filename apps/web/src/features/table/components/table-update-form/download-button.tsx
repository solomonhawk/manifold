import { isEmpty } from "@manifold/lib/utils/object";
import { Button } from "@manifold/ui/components/ui/button";
import { cn } from "@manifold/ui/lib/utils";
import { forwardRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { GoDownload } from "react-icons/go";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tableId: string;
}

export const DownloadButton = forwardRef<HTMLButtonElement, Props>(
  ({ tableId, className, disabled, ...props }, ref) => {
    const { formState, control } = useFormContext();
    const definition = useWatch({ control, name: "definition" });
    const canDownload =
      definition !== "" &&
      isEmpty(formState.dirtyFields) &&
      !formState.isSubmitting &&
      formState.isValid;

    const Comp = canDownload ? "a" : "button";

    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="sm"
        asChild
        {...props}
        className={cn(className, "grow justify-start")}
        disabled={disabled || !canDownload}
      >
        <Comp href={`/api/table/${tableId}/download`}>
          <GoDownload />
          Download Definition
        </Comp>
      </Button>
    );
  },
);

DownloadButton.displayName = "DownloadButton";
