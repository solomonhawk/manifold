import type { TableMetadata } from "@manifold/lib/models/roll";
import { RollTableButtons } from "@manifold/ui/components/roll-table-buttons";
import { useAtom, useAtomValue } from "jotai";
import { memo, type RefObject, useCallback } from "react";
import { v4 as uuid } from "uuid";

import {
  canRollResultAtom,
  currentTableHashAtom,
  exportedOnlyAtom,
  rollHistoryAtom,
  visibleTableMetadataAtom,
} from "../state";
import { workerInstance } from "../worker";

export const RollableTables = memo(function AvailableTables({
  inputRef,
  onRoll,
}: {
  inputRef: RefObject<HTMLTextAreaElement>;
  onRoll?: () => void;
}) {
  const tableHash = useAtomValue(currentTableHashAtom);
  const tableMetadata = useAtomValue(visibleTableMetadataAtom);
  const isEnabled = useAtomValue(canRollResultAtom);
  const [showExportedOnly, setShowExportedOnly] = useAtom(exportedOnlyAtom);
  const [rollResults, setRollResults] = useAtom(rollHistoryAtom);

  const handleRoll = useCallback(
    async function handleRoll(table: TableMetadata) {
      if (!tableHash) {
        throw new Error("Missing table hash!");
      }

      const result = await workerInstance.gen(
        tableHash,
        inputRef.current?.value || "",
        table.id,
      );

      setRollResults((results) =>
        [
          {
            id: uuid(),
            tableName: table.title,
            tableId: table.id,
            timestamp: Date.now(),
            text: result,
          },
        ].concat(results),
      );

      onRoll?.();
    },
    [onRoll, setRollResults, tableHash, inputRef],
  );

  return (
    <RollTableButtons
      className="p-16"
      isEnabled={isEnabled}
      onRoll={handleRoll}
      rollResults={rollResults}
      tableMetadata={tableMetadata}
      showExportedOnly={showExportedOnly}
      setShowExportedOnly={setShowExportedOnly}
    />
  );
});
