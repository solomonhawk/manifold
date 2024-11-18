import { RollResultsList } from "@manifold/ui/components/roll-results-list";
import { useAtom } from "jotai";
import { type RefObject, useCallback } from "react";

import { rollHistoryAtom } from "~features/engine/components/editor/state";

export function ResultsList({
  listRef,
}: {
  listRef: RefObject<HTMLUListElement>;
}) {
  const [rollResults, setRollResults] = useAtom(rollHistoryAtom);

  const handleRemoveResult = useCallback(
    (timestamp: number) => {
      setRollResults((results) =>
        results.filter((r) => r.timestamp !== timestamp),
      );
    },
    [setRollResults],
  );

  const handleClearResults = useCallback(
    function handleClearResults() {
      setRollResults([]);
    },
    [setRollResults],
  );

  return (
    <RollResultsList
      className="min-h-0 px-16"
      listRef={listRef}
      rollResults={rollResults}
      onRemove={handleRemoveResult}
      onClear={handleClearResults}
    />
  );
}
