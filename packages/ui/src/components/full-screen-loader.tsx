import { LoadingIndicator } from "#components/loading-indicator.tsx";
import { FlexCol } from "#components/ui/flex.tsx";
import { cn } from "#lib/utils.ts";

export function FullScreenLoader({ className }: { className?: string }) {
  return (
    <FlexCol className={cn("items-center justify-center", className)}>
      <LoadingIndicator />
    </FlexCol>
  );
}
