import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@manifold/ui/components/ui/command";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { Textarea } from "@manifold/ui/components/ui/textarea";
import {
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClientPoint,
  useDismiss,
  useFloating,
  useInteractions,
} from "@manifold/ui/lib/floating-ui";
import { cn } from "@manifold/ui/lib/utils";
import { useSetAtom } from "jotai";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RefCallBack } from "react-hook-form";
import { Caret } from "textarea-caret-ts";

import { currentTableHash, currentTableMetadata, rollHistory } from "./state";
import { workerInstance } from "./worker";

type Props = {
  inputRef: MutableRefObject<HTMLTextAreaElement>;
  refCallback: RefCallBack;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onParseError: (error: string) => void;
  onParseSuccess: () => void;
};

export function InputPanel({
  inputRef,
  refCallback,
  name,
  value,
  onChange,
  onBlur,
  onParseError,
  onParseSuccess,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const setTableHash = useSetAtom(currentTableHash);
  const setRollResults = useSetAtom(rollHistory);
  const setTableMetadata = useSetAtom(currentTableMetadata);
  const [menuPosition, setMenuPosition] = useState<Caret.Position | null>(null);

  const [isInlineEditorCommandPaletteOpen, setInlineEditorCommandPaletteOpen] =
    useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: "right-start",
    open: isInlineEditorCommandPaletteOpen,
    onOpenChange: (nextIsOpen) => {
      setInlineEditorCommandPaletteOpen(nextIsOpen);

      const { start, end } = selectionRef.current ?? { start: 0, end: 0 };

      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(start, end, "forward");
    },
    middleware: [
      offset({
        crossAxis: -12,
        mainAxis: 8,
      }),
      shift({
        mainAxis: true,
        crossAxis: false,
        altBoundary: true,
        padding: 8,
      }),
    ],
  });

  const clientPoint = useClientPoint(context, {
    enabled: !!menuPosition,
    x: menuPosition?.left,
    y: menuPosition?.top,
  });

  const dismiss = useDismiss(context, {
    escapeKey: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    clientPoint,
    dismiss,
  ]);

  const parseAndValidate = useCallback(
    async function parseAndValidate(value: string) {
      try {
        if (value) {
          const { hash, metadata } = await workerInstance.parse(value);

          setTableHash(hash);
          setTableMetadata(metadata);
        } else {
          setTableHash(null);
          setTableMetadata([]);
        }

        onParseSuccess();
      } catch (e: unknown) {
        console.error(e);

        onParseError(String(e));
      }
    },
    [onParseSuccess, onParseError, setTableHash, setTableMetadata],
  );

  const updateValueSelectionAndTable = useCallback(
    (currentValue: string, selectionStart: number, selectionEnd: number) => {
      selectionRef.current = {
        start: selectionStart,
        end: selectionEnd,
      };

      setMenuPosition(Caret.getAbsolutePosition(inputRef.current));
      parseAndValidate(currentValue.trim());
      onChange(currentValue);
    },
    [inputRef, onChange, parseAndValidate],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
      setInlineEditorCommandPaletteOpen(true);
      setMenuPosition(Caret.getAbsolutePosition(e.currentTarget));
      e.preventDefault();
    }
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      updateValueSelectionAndTable(
        e.target.value,
        e.target.selectionStart,
        e.target.selectionEnd,
      );
    },
    [updateValueSelectionAndTable],
  );

  const handleCreateNewSubtable = useCallback(() => {
    // just append a new basic table to the end
    const currentValue = value.trim();
    const newTable = "---\ntitle: Table\nid: table\n---\n1: outcome";
    const modifiedValue = currentValue.length
      ? `${currentValue}\n\n${newTable}`
      : newTable;

    // @XXX: magic numbers that depend on the `newTable` above
    const selectionStart = modifiedValue.length - 30;
    const selectionEnd = modifiedValue.length - 25;

    setInlineEditorCommandPaletteOpen(false);
    updateValueSelectionAndTable(modifiedValue, selectionStart, selectionEnd);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(
        selectionStart,
        selectionEnd,
        "forward",
      );

      containerRef.current?.scrollTo({
        top: containerRef.current?.scrollHeight,
        behavior: "instant",
      });
    });
  }, [inputRef, updateValueSelectionAndTable, value]);

  useEffect(() => {
    if (value) {
      parseAndValidate(value);
    }

    // oof, maybe I can put the jotai atoms into a context?
    return () => {
      setRollResults([]);
      setTableHash(null);
      setTableMetadata([]);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FlexCol
      ref={containerRef}
      className={cn("relative flex-row p-4 md:p-8", {
        "overflow-auto": !isInlineEditorCommandPaletteOpen,
        "overflow-hidden": isInlineEditorCommandPaletteOpen,
      })}
    >
      <div
        className="absolute"
        ref={refs.setReference}
        {...getReferenceProps()}
        style={{ top: menuPosition?.top, left: menuPosition?.left }}
      />

      {/* @TODO: add context menu at cursor position when `/` is typed or keyboard combination is pressed */}
      {isInlineEditorCommandPaletteOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <InlineEditorCommandPalette
                onCreateNewSubtable={handleCreateNewSubtable}
              />
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}

      <Textarea
        autoSize
        className="bg-background/60 resize-none font-mono"
        ref={(node) => {
          // @NOTE: kind of annoying, RHF wants to use a ref callback, but we also want to use a ref object
          refCallback(node);

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          inputRef.current = node!;
        }}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </FlexCol>
  );
}

function InlineEditorCommandPalette({
  onCreateNewSubtable,
}: {
  onCreateNewSubtable: () => void;
}) {
  return (
    <Command className="border shadow-lg drop-shadow-lg">
      <CommandInput autoFocus />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={onCreateNewSubtable}>
            <span>Create a new subtable</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
