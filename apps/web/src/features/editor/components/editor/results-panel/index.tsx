import { FlexCol } from "@manifold/ui/components/ui/flex";
import { LayoutGroup } from "framer-motion";
import { type RefObject } from "react";

import { RollResults } from "~features/editor/components/editor/results-panel/results-list";
import { RollableTables } from "~features/editor/components/editor/results-panel/rollable-tables";

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
        <RollableTables inputRef={inputRef} onRoll={onRoll} />
        <RollResults listRef={listRef} />
      </LayoutGroup>
    </FlexCol>
  );
}
