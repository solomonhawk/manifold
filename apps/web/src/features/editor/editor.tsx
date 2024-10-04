import {
  CircleBackslashIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useAtom } from "jotai";
import { useRef, type ChangeEvent } from "react";
import {
  currentTableHash,
  currentTableMetadata,
  rollHistory,
  tableError,
  type TableMetadata,
} from "./state";

const workerInstance = new ComlinkWorker<typeof import("./worker.js")>(
  new URL("./worker", import.meta.url)
);

export function Editor() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useAtom(tableError);
  const [tableHash, setTableHash] = useAtom(currentTableHash);
  const [tableMetadata, setTableMetadata] = useAtom(currentTableMetadata);
  const [rollResults, setRollResults] = useAtom(rollHistory);

  async function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value.trim();

    try {
      console.clear();

      if (value) {
        const hash = await workerInstance.parse(value);
        const tableMetadata = await workerInstance.tableMetadata(hash);

        setTableHash(hash);
        setTableMetadata(tableMetadata);

        console.log("main", hash, tableMetadata);
      }

      setError(null);
    } catch (e: unknown) {
      console.error(e);
      setError(String(e));
    }
  }

  async function handleRoll(e: React.MouseEvent, table: TableMetadata) {
    e.preventDefault();

    if (!tableHash) {
      throw new Error("Missing table hash!");
    }

    const result = await workerInstance.gen(
      tableHash,
      textAreaRef.current?.value || "",
      table.id
    );

    setRollResults((results) =>
      [
        {
          tableName: table.title,
          tableId: table.id,
          timestamp: Date.now(),
          text: result,
        },
      ].concat(results)
    );
  }

  function handleClearResults() {
    setRollResults([]);
  }

  return (
    <div className="flex gap-2 flex-col md:flex-row min-h-full">
      <div className="flex flex-col flex-1 lg:flex-initial gap-2">
        <textarea
          ref={textAreaRef}
          name="tabol-definition"
          className="w-full flex-1"
          rows={20}
          cols={48}
          onChange={handleChange}
        ></textarea>
        {error && <span className="error">{error}</span>}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tableHash && tableMetadata.length > 0 ? (
          <ul className="flex flex-wrap gap-1 mb-2">
            {tableMetadata.map((table) => {
              return (
                <li key={table.id}>
                  <Button type="button" onClick={(e) => handleRoll(e, table)}>
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
                      <CardContent className="grid grid-cols-roll-results gap-2 p-4">
                        <span className="text-slate-400 text-nowrap">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>

                        <span className="font-bold">{result.text}</span>

                        <span>
                          <span className="text-sm bg-slate-700 rounded-full px-2 py-1">
                            {result.tableName}
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
                onClick={handleClearResults}
                className="gap-1"
              >
                <CircleBackslashIcon />
                Clear Results
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 justify-center text-slate-500">
                <QuestionMarkCircledIcon className="size-6" />
                Your roll results will show up here.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
