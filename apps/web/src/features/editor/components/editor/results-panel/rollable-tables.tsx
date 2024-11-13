import { AnimatedList } from "@manifold/ui/components/animated-list";
import { Button } from "@manifold/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@manifold/ui/components/ui/tooltip";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, type RefObject, useCallback } from "react";
import { GoLinkExternal, GoListUnordered } from "react-icons/go";

import {
  canRollResultAtom,
  currentTableHashAtom,
  type EditorStatus,
  editorStatusAtom,
  exportedOnlyAtom,
  rollHistoryAtom,
  type TableMetadata,
  visibleTableMetadataAtom,
} from "../state";
import { workerInstance } from "../worker";

let id = 0;

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
  const setRollResults = useSetAtom(rollHistoryAtom);

  const handleRoll = useCallback(
    async function handleRoll(e: React.MouseEvent, table: TableMetadata) {
      e.preventDefault();

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
            id: id++,
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
    <div className="flex flex-col gap-16 p-16">
      <div className="flex items-center">
        <span className="mr-auto text-sm font-semibold">
          {status === "valid"
            ? "Available Tables:"
            : displayEditorStatus(status)}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowExportedOnly(!showExportedOnly)}
            >
              <span className="sr-only">
                {showExportedOnly ? "Show all tables" : "Show exported only"}
              </span>

              {showExportedOnly ? <GoListUnordered /> : <GoLinkExternal />}
            </Button>
          </TooltipTrigger>

          <TooltipContent side="left">
            {showExportedOnly ? "Show all tables" : "Show exported only"}
          </TooltipContent>
        </Tooltip>
      </div>

      <AnimatedList
        className="flex flex-wrap gap-8"
        transition={transitionAlpha}
      >
        {tableHash && tableMetadata.length > 0
          ? tableMetadata.map((table) => {
              return (
                <motion.li
                  key={table.id}
                  layout="position"
                  transition={transitionAlpha}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleRoll(e, table)}
                    className={table.export ? "font-semibold" : undefined}
                    disabled={!isEnabled}
                  >
                    {table.title}
                  </Button>
                </motion.li>
              );
            })
          : null}
      </AnimatedList>
    </div>
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
