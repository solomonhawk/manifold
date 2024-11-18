import { isEmpty } from "@manifold/lib";
import { Button } from "@manifold/ui/components/ui/button";
import { useFormContext, useWatch } from "react-hook-form";
import { GoDownload } from "react-icons/go";

export function DownloadButton({ tableId }: { tableId: string }) {
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
      type="button"
      disabled={!canDownload}
      variant="ghost"
      size="sm"
      // className="gap-8 !p-8"
      className="w-full justify-start"
      asChild
    >
      <Comp href={`/api/table/${tableId}/download`}>
        <GoDownload />
        Download Definition
      </Comp>
    </Button>
  );
}
