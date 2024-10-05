import {
  CircleBackslashIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useAtomValue } from "jotai";
import {
  currentTableHash,
  currentTableMetadata,
  rollHistory,
  type TableMetadata,
} from "./state";

type Props = {
  onRoll: (e: React.MouseEvent, table: TableMetadata) => void;
  onClear: (e: React.MouseEvent) => void;
};

export function ResultsPanel({ onRoll, onClear }: Props) {
  const tableHash = useAtomValue(currentTableHash);
  const tableMetadata = useAtomValue(currentTableMetadata);
  const rollResults = useAtomValue(rollHistory);

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 min-h-0">
      {tableHash && tableMetadata.length > 0 ? (
        <ul className="flex flex-wrap gap-1 mb-2">
          {tableMetadata.map((table) => {
            return (
              <li key={table.id}>
                <Button type="button" onClick={(e) => onRoll(e, table)}>
                  {table.title}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {rollResults.length > 0 ? (
        <>
          <ul className="flex flex-col gap-2 min-h-0 overflow-auto">
            {rollResults.map((result, i) => {
              return (
                <li key={i}>
                  <Card>
                    <CardContent className="flex items-start gap-2 p-4">
                      <span className="font-bold grow">{result.text}</span>

                      <span className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          {result.tableName}
                        </Badge>

                        <span className="text-slate-400 text-nowrap text-sm">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </span>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onClear}
              className="gap-1"
              variant="destructive"
            >
              <CircleBackslashIcon />
              Clear Results
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 justify-center text-slate-500">
              <QuestionMarkCircledIcon className="size-6" />
              Your roll results will show up here.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
