import { AnimatedList } from "@manifold/ui/components/animated-list";
import { Button } from "@manifold/ui/components/ui/button";
import { Checkbox } from "@manifold/ui/components/ui/checkbox";
import { transitionAlpha } from "@manifold/ui/lib/animation";
import { motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, type RefObject, useCallback } from "react";

import {
  currentTableHash,
  exportedOnly,
  rollHistory,
  type TableMetadata,
  visibleTableMetadata,
} from "../state";
import { workerInstance } from "../worker";

export const AvailableTables = memo(function AvailableTables({
  inputRef,
  onRoll,
}: {
  inputRef: RefObject<HTMLTextAreaElement>;
  onRoll?: () => void;
}) {
  const tableHash = useAtomValue(currentTableHash);
  const tableMetadata = useAtomValue(visibleTableMetadata);
  const [showExportedOnly, setShowExportedOnly] = useAtom(exportedOnly);
  const setRollResults = useSetAtom(rollHistory);

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
        <span className="mr-auto">Available Tables:</span>

        <Checkbox
          id="exported"
          checked={showExportedOnly}
          onCheckedChange={(checked) =>
            setShowExportedOnly(checked === "indeterminate" ? false : checked)
          }
        />
        <label
          htmlFor="exported"
          className="pl-8 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Exported Only
        </label>
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
