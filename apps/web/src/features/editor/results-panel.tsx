import { AnimatedList } from "@manifold/ui/components/animated-list";
import { ClipboardCopy } from "@manifold/ui/components/clipboard-copy";
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
import { GoCheck, GoPaste, GoX } from "react-icons/go";

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
          className="pl-8 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
        className={cn("flex min-h-0 flex-col gap-8 overflow-auto px-16", {
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
              <div className="flex items-center justify-center gap-8 text-slate-500">
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
      <CardContent className="@md:flex-row flex flex-col items-stretch gap-8 !p-16">
        <span className="grow">
          <Typewriter transition={transitionAlpha}>{text}</Typewriter>
        </span>

        <div className="@md:flex-col @md:w-auto flex w-full grow flex-row items-end justify-between gap-8">
          <span className="flex items-center gap-8">
            <Badge variant="secondary" className="whitespace-nowrap">
              {tableName}
            </Badge>

            <span className="text-nowrap text-sm text-slate-400">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </span>

          <div className="@md:m-0 -mb-6 -mr-6 flex items-center gap-8 opacity-0 transition-opacity group-hover:opacity-100">
            <ClipboardCopy>
              {({ copied, onCopy }) => {
                return (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onCopy(text)}
                  >
                    {copied ? <GoCheck /> : <GoPaste />}
                  </Button>
                );
              }}
            </ClipboardCopy>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
            >
              <GoX />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
