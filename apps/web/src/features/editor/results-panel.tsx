import { CircleBackslashIcon, CubeIcon } from "@radix-ui/react-icons";
import { AnimatedList } from "@repo/ui/components/animated-list";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { LayoutGroup, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { memo } from "react";
import {
  currentTableHash,
  exportedOnly,
  rollHistory,
  visibleTableMetadata,
  type RollResult,
  type TableMetadata,
} from "./state";
import { Checkbox } from "@repo/ui/components/ui/checkbox";

type Props = {
  onRoll: (e: React.MouseEvent, table: TableMetadata) => void;
  onClear: (e: React.MouseEvent) => void;
};

const transition = {
  type: "spring",
  damping: 40,
  stiffness: 500,
  mass: 0.5,
};

export function ResultsPanel({ onRoll, onClear }: Props) {
  const tableHash = useAtomValue(currentTableHash);
  const tableMetadata = useAtomValue(visibleTableMetadata);
  const rollResults = useAtomValue(rollHistory);
  const [showExportedOnly, setShowExportedOnly] = useAtom(exportedOnly);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center space-x-2">
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
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Exported Only
          </label>
        </div>

        {tableHash && tableMetadata.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {tableMetadata.map((table) => {
              return (
                <li key={table.id}>
                  <Button
                    type="button"
                    onClick={(e) => onRoll(e, table)}
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

      <LayoutGroup>
        <AnimatedList
          className="flex flex-col min-h-0 px-2 gap-2 overflow-auto"
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
            className="flex justify-end p-2"
            layout
            transition={transition}
          >
            <Button
              type="button"
              onClick={onClear}
              className="gap-1"
              variant="destructive"
            >
              <CircleBackslashIcon />
              Clear Results
            </Button>
          </motion.div>
        ) : null}

        {rollResults.length === 0 ? (
          <div className="p-2">
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
    </div>
  );
}

const ListItem = memo(function ({
  text,
  tableName,
  timestamp,
}: Pick<RollResult, "text" | "tableName" | "timestamp">) {
  return (
    <Card>
      <CardContent className="flex items-start gap-2 p-4">
        <span className="font-bold grow">{text}</span>

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
