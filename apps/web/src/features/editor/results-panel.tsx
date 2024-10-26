import { AnimatedList } from "@manifold/ui/components/animated-list";
import { Typewriter } from "@manifold/ui/components/typewriter";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { Card, CardContent } from "@manifold/ui/components/ui/card";
import { Checkbox } from "@manifold/ui/components/ui/checkbox";
import { cn } from "@manifold/ui/lib/utils";
import { CircleBackslashIcon, CubeIcon } from "@radix-ui/react-icons";
import { LayoutGroup, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, type RefObject, useCallback, useState } from "react";
import { GoX } from "react-icons/go";

import { transitionAlpha } from "~utils/animation";

import {
  currentTableHash,
  exportedOnly,
  rollHistory,
  type RollResult,
  type TableMetadata,
  visibleTableMetadata,
} from "./state";
import { workerInstance } from "./worker";

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
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pl-8"
        >
          Exported Only
        </label>
      </div>

      {tableHash && tableMetadata.length > 0 ? (
        <ul className="flex flex-wrap gap-8">
          {tableMetadata.map((table) => {
            return (
              <li key={table.id}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleRoll(e, table)}
                  className={table.export ? "font-semibold" : undefined}
                >
                  {table.title}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
});

export const RollResults = memo(function RollResults({
  listRef,
}: {
  listRef: RefObject<HTMLUListElement>;
}) {
  const [listOverflowing, setListOverflowing] = useState(false);
  const [rollResults, setRollResults] = useAtom(rollHistory);

  const handleClearResults = useCallback(
    function handleClearResults() {
      setRollResults([]);
    },
    [setRollResults],
  );

  const updateListOverflowing = useCallback(() => {
    if (listRef.current) {
      setListOverflowing(
        listRef.current.scrollHeight > listRef.current.clientHeight,
      );
    }
  }, [listRef]);

  return (
    <LayoutGroup>
      <AnimatedList
        listRef={listRef}
        data={rollResults}
        transition={transitionAlpha}
        className={cn("flex flex-col min-h-0 px-16 gap-8 overflow-auto", {
          "fade-bottom-90 pb-[5%]": listOverflowing,
        })}
        onLayoutAnimationStart={updateListOverflowing}
        onLayoutAnimationComplete={updateListOverflowing}
        computeKey={(result) => `${result.timestamp}-${result.text}`}
        renderRow={(result) => (
          <ListItem
            text={result.text}
            tableName={result.tableName}
            timestamp={result.timestamp}
            onRemove={() => {
              setRollResults((results) =>
                results.filter((r) => r.timestamp !== result.timestamp),
              );
            }}
          />
        )}
      />

      {rollResults.length > 0 ? (
        <motion.div
          className="flex justify-end p-16"
          layout
          transition={transitionAlpha}
        >
          <Button
            type="button"
            onClick={handleClearResults}
            className="gap-4"
            variant="destructive-outline"
          >
            <CircleBackslashIcon />
            Clear Results
          </Button>
        </motion.div>
      ) : null}

      {rollResults.length === 0 ? (
        <div className="p-16">
          <Card>
            <CardContent className="!p-16">
              <div className="flex items-center gap-8 justify-center text-slate-500">
                <CubeIcon className="size-24" />
                Your roll results will show up here.
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </LayoutGroup>
  );
});

const ListItem = memo(function ({
  text,
  tableName,
  timestamp,
  onRemove,
}: Pick<RollResult, "text" | "tableName" | "timestamp"> & {
  onRemove?: () => void;
}) {
  return (
    <Card className="group">
      <CardContent className="flex flex-col items-stretch gap-8 !p-16 @md:flex-row">
        <span className="grow">
          <Typewriter transition={transitionAlpha}>{text}</Typewriter>
        </span>

        <div className="flex grow w-full flex-row items-end justify-between @md:flex-col @md:w-auto gap-8">
          <span className="flex items-center gap-8">
            <Badge variant="secondary" className="whitespace-nowrap">
              {tableName}
            </Badge>

            <span className="text-slate-400 text-nowrap text-sm">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-6 -mb-6 @md:m-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <GoX />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
