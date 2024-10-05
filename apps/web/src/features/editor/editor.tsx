import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";
import { useAtom, useSetAtom } from "jotai";
import { useRef, type ChangeEvent } from "react";
import { InputPanel } from "./input-panel";
import { ResultsPanel } from "./results-panel";
import {
  currentTableHash,
  currentTableMetadata,
  rollHistory,
  tableError,
  type TableMetadata,
} from "./state";

const workerInstance = new ComlinkWorker<typeof import("./worker.js")>(
  new URL("./worker", import.meta.url),
  {
    name: "wasm-bridge-worker",
    type: "module",
  }
);

export function Editor() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [tableHash, setTableHash] = useAtom(currentTableHash);
  const setError = useSetAtom(tableError);
  const setTableMetadata = useSetAtom(currentTableMetadata);
  const setRollResults = useSetAtom(rollHistory);

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
    <ResizablePanelGroup direction="horizontal" className="flex min-h-full">
      <ResizablePanel
        minSize={30}
        defaultSize={30}
        className="flex flex-col flex-1 lg:flex-initial"
      >
        <InputPanel textAreaRef={textAreaRef} onChange={handleChange} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={30} className="flex flex-col flex-1">
        <ResultsPanel onRoll={handleRoll} onClear={handleClearResults} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
