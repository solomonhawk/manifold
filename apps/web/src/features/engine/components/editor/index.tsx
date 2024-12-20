import type { RouterOutput } from "@manifold/router";
import { FlexCol } from "@manifold/ui/components/core/flex";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@manifold/ui/components/core/resizable";
import { type MutableRefObject, useCallback, useRef } from "react";
import type { RefCallBack } from "react-hook-form";

import { InputPanel } from "./input-panel";
import { ResultsPanel } from "./results-panel";

type Props = {
  tableIdentifier: string;
  name: string;
  value: string | undefined;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  refCallback: RefCallBack;
  onParseError: (error: string) => void;
  onParseSuccess: (availableTables: string[]) => void;
  resolvedDependencies: RouterOutput["table"]["get"]["dependencies"];
};

export function Editor({
  tableIdentifier,
  name,
  value,
  isDisabled,
  onChange,
  onBlur,
  refCallback,
  onParseError,
  onParseSuccess,
  resolvedDependencies,
}: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleRoll = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <FlexCol asChild>
      <ResizablePanelGroup direction="horizontal" className="rounded-md border">
        <ResizablePanel
          minSize={30}
          defaultSize={50}
          className="flex flex-1 lg:flex-initial"
        >
          <InputPanel
            tableIdentifier={tableIdentifier}
            inputRef={inputRef as MutableRefObject<HTMLTextAreaElement>}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            refCallback={refCallback}
            onParseError={onParseError}
            onParseSuccess={onParseSuccess}
            isDisabled={isDisabled}
            initialResolvedDependencies={resolvedDependencies}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel minSize={30} className="flex flex-1">
          <ResultsPanel
            inputRef={inputRef}
            listRef={listRef}
            onRoll={handleRoll}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </FlexCol>
  );
}
