import { FlexCol } from "#components/core/flex/flex.js";
import { LoadingIndicator } from "#components/loading-indicator/loading-indicator.js";
import { cn } from "#lib/utils.js";

export function FullScreenLoader({ className }: { className?: string }) {
  return (
    <FlexCol className={cn("items-center justify-center", className)}>
      <LoadingIndicator />
    </FlexCol>
  );
}
