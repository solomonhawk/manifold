import { FlexCol } from "@manifold/ui/components/ui/flex";
import { LayoutGroup } from "framer-motion";
import { type RefObject } from "react";

import { AvailableTables } from "~features/editor/results-panel/available-tables";
import { RollResults } from "~features/editor/results-panel/results-list";

export function ResultsPanel({
  inputRef,
  listRef,
  onRoll,
}: {
  inputRef: RefObject<HTMLTextAreaElement>;
  listRef: RefObject<HTMLUListElement>;
  onRoll: () => void;
}) {
  return (
    <FlexCol className="@container bg-background/60">
      <LayoutGroup>
        <AvailableTables inputRef={inputRef} onRoll={onRoll} />
        <RollResults listRef={listRef} />
      </LayoutGroup>
    </FlexCol>
  );
}
