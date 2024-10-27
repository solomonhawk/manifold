import { LoadingIndicator } from "#components/loading-indicator.tsx";
import { FlexCol } from "#components/ui/flex.tsx";

export function FullScreenLoader() {
  return (
    <FlexCol className="items-center justify-center">
      <LoadingIndicator />
    </FlexCol>
  );
}
