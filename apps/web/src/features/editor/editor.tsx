import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@manifold/ui/components/ui/resizable";
import { useCallback, useRef } from "react";

import { InputPanel } from "./input-panel";
import { AvailableTables, RollResults } from "./results-panel";

export function Editor() {
  const listRef = useRef<HTMLUListElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleRoll = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex h-full min-h-0 border"
    >
      <ResizablePanel
        minSize={20}
        defaultSize={30}
        className="flex flex-col flex-1 lg:flex-initial"
      >
        <InputPanel textAreaRef={textAreaRef} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={50} className="flex flex-col flex-1">
        <div className="flex flex-1 flex-col min-h-0 @container">
          <AvailableTables textAreaRef={textAreaRef} onRoll={handleRoll} />
          <RollResults listRef={listRef} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
