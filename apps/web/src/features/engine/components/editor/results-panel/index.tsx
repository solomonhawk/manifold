import { FlexCol } from "@manifold/ui/components/ui/flex";
import { LayoutGroup } from "motion/react";
import { type RefObject } from "react";

import { ResultsList } from "~features/engine/components/editor/results-panel/results-list";
import { RollableTables } from "~features/engine/components/editor/results-panel/rollable-tables";

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
    <LayoutGroup>
      <FlexCol className="bg-background/60 @container">
        <RollableTables inputRef={inputRef} onRoll={onRoll} />
        <ResultsList listRef={listRef} />
      </FlexCol>
    </LayoutGroup>
  );
}
