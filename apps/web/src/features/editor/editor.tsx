import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/ui/components/ui/resizable";
import { useRef } from "react";
import { InputPanel } from "./input-panel";
import { AvailableTables, RollResults } from "./results-panel";

export function Editor() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex min-h-full">
      <ResizablePanel
        minSize={20}
        defaultSize={30}
        className="flex flex-col flex-1 lg:flex-initial"
      >
        <InputPanel textAreaRef={textAreaRef} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel minSize={50} className="flex flex-col flex-1">
        <div className="flex flex-1 flex-col min-h-0">
          <AvailableTables textAreaRef={textAreaRef} />
          <RollResults />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
