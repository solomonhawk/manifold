import type { TableMetadata } from "@manifold/lib/models/roll";
import { RollTableButtons } from "@manifold/ui/components/roll-table-buttons";
import { useAtom, useAtomValue } from "jotai";
import { memo, type RefObject, useCallback } from "react";
import { v4 as uuid } from "uuid";

import {
  canRollResultAtom,
  currentTableHashAtom,
  type EditorStatus,
  editorStatusAtom,
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
  const status = useAtomValue(editorStatusAtom);
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
      label={
        status === "valid" ? "Available Tables:" : displayEditorStatus(status)
      }
      isEnabled={isEnabled}
      onRoll={handleRoll}
      rollResults={rollResults}
      tableMetadata={tableMetadata}
      showExportedOnly={showExportedOnly}
      setShowExportedOnly={setShowExportedOnly}
    />
  );
});

function displayEditorStatus(status: EditorStatus) {
  switch (status) {
    case "initial":
      return "Loading...";
    case "parsing":
      return "Parsing...";
    case "parse_error":
      return "Parse Error";
    case "validation_error":
      return "Validation Error";
    case "fetching_dependencies":
      return "Fetching Dependencies...";
    default:
      return "Unknown Status";
  }
}
