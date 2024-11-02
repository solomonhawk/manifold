import { FlexCol } from "@manifold/ui/components/ui/flex";
import { LayoutGroup } from "framer-motion";
import { type RefObject } from "react";

import { AvailableTables } from "~features/editor/components/editor/results-panel/available-tables";
import { RollResults } from "~features/editor/components/editor/results-panel/results-list";

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
    <FlexCol className="bg-background/60 @container">
      <LayoutGroup>
        <AvailableTables inputRef={inputRef} onRoll={onRoll} />
        <RollResults listRef={listRef} />
      </LayoutGroup>
    </FlexCol>
  );
}
