import { FlexCol } from "@manifold/ui/components/ui/flex";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@manifold/ui/components/ui/resizable";
import { type MutableRefObject, useCallback, useRef } from "react";
import type { RefCallBack } from "react-hook-form";

import { InputPanel } from "./input-panel";
import { AvailableTables, RollResults } from "./results-panel";

type Props = {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  refCallback: RefCallBack;
  onParseError: (error: string) => void;
  onParseSuccess: () => void;
};

export function Editor({
  name,
  value,
  onChange,
  onBlur,
  refCallback,
  onParseError,
  onParseSuccess,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleRoll = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <FlexCol asChild>
      <ResizablePanelGroup direction="horizontal" className="border">
        <ResizablePanel
          minSize={20}
          defaultSize={50}
          className="flex flex-col flex-1 lg:flex-initial"
        >
          <InputPanel
            inputRef={inputRef as MutableRefObject<HTMLTextAreaElement>}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            refCallback={refCallback}
            onParseError={onParseError}
            onParseSuccess={onParseSuccess}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel minSize={50} className="flex flex-col flex-1">
          <FlexCol className="@container bg-background/60">
            <AvailableTables inputRef={inputRef} onRoll={handleRoll} />
            <RollResults listRef={listRef} />
          </FlexCol>
        </ResizablePanel>
      </ResizablePanelGroup>
    </FlexCol>
  );
}
