import { CircleBackslashIcon, CubeIcon } from "@radix-ui/react-icons";
import { AnimatedList } from "@repo/ui/components/animated-list";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { LayoutGroup, motion, type Transition } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, type RefObject } from "react";
import {
  currentTableHash,
  exportedOnly,
  rollHistory,
  visibleTableMetadata,
  type RollResult,
  type TableMetadata,
} from "./state";
import { workerInstance } from "./worker";
import { TextTyper } from "@repo/ui/components/text-typer";

const transition = {
  type: "spring",
  damping: 40,
  stiffness: 500,
  mass: 0.5,
} satisfies Transition;

export const AvailableTables = memo(function AvailableTables({
  textAreaRef,
}: {
  textAreaRef: RefObject<HTMLTextAreaElement>;
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
        textAreaRef.current?.value || "",
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
    },
    [setRollResults, tableHash, textAreaRef],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
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
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pl-2"
        >
          Exported Only
        </label>
      </div>

      {tableHash && tableMetadata.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
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

export const RollResults = memo(function RollResults() {
  const [rollResults, setRollResults] = useAtom(rollHistory);

  const handleClearResults = useCallback(
    function handleClearResults() {
      setRollResults([]);
    },
    [setRollResults],
  );

  return (
    <LayoutGroup>
      <AnimatedList
        className="flex flex-col min-h-0 px-4 gap-2 overflow-auto"
        data={rollResults}
        transition={transition}
        computeKey={(result) => `${result.timestamp}-${result.text}`}
        renderRow={(result) => (
          <ListItem
            text={result.text}
            tableName={result.tableName}
            timestamp={result.timestamp}
          />
        )}
      />

      {rollResults.length > 0 ? (
        <motion.div
          className="flex justify-end p-4"
          layout
          transition={transition}
        >
          <Button
            type="button"
            onClick={handleClearResults}
            className="gap-1"
            variant="destructive"
          >
            <CircleBackslashIcon />
            Clear Results
          </Button>
        </motion.div>
      ) : null}

      {rollResults.length === 0 ? (
        <div className="p-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 justify-center text-slate-500">
                <CubeIcon className="size-6" />
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
}: Pick<RollResult, "text" | "tableName" | "timestamp">) {
  return (
    <Card>
      <CardContent className="flex items-start gap-2 p-4">
        <span className="font-bold grow">
          <TextTyper transition={transition}>{text}</TextTyper>
        </span>

        <span className="flex items-center gap-2">
          <Badge variant="secondary" className="whitespace-nowrap">
            {tableName}
          </Badge>

          <span className="text-slate-400 text-nowrap text-sm">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </span>
      </CardContent>
    </Card>
  );
});
