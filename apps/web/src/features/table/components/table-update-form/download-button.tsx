import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { useFormContext, useWatch } from "react-hook-form";
import { GoDownload } from "react-icons/go";

export function DownloadButton({ tableId }: { tableId: string }) {
  const { formState, control } = useFormContext();
  const definition = useWatch({ control, name: "definition" });
  const canDownload =
    definition !== "" &&
    !formState.isDirty &&
    !formState.isSubmitting &&
    formState.isValid;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild size="icon" variant="outline" disabled={!canDownload}>
          {/* Anchors can't be `disabled`, so we just render a <button> if
              downloading isn't available (form is invalid, dirty or unsaved) */}
          {canDownload ? (
            <a href={`/api/table/${tableId}/download`}>
              <span className="sr-only">Download Table Definition</span>
              <GoDownload />
            </a>
          ) : (
            <button type="button">
              <span className="sr-only">Download Table Definition</span>
              <GoDownload />
            </button>
          )}
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        Download Table Definition
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
}
