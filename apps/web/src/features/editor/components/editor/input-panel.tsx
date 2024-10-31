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
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RefCallBack } from "react-hook-form";
import { Caret } from "textarea-caret-ts";

import { log } from "~utils/logger";

import { currentTableHash, currentTableMetadata, rollHistory } from "./state";
import { workerInstance } from "./worker";

type Selection = { start: number; end: number };

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
  const selectionRef = useRef<Selection | null>(null);
  const menuPositionRef = useRef<Caret.Position | null>(null);
  const setTableHash = useSetAtom(currentTableHash);
  const setRollResults = useSetAtom(rollHistory);
  const setTableMetadata = useSetAtom(currentTableMetadata);

  const [isInlineEditorCommandPaletteOpen, setInlineEditorCommandPaletteOpen] =
    useState(false);

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
        log.error(e);

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

      parseAndValidate(currentValue.trim());
      onChange(currentValue);
    },
    [onChange, parseAndValidate],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
      menuPositionRef.current = Caret.getAbsolutePosition(e.currentTarget);
      setInlineEditorCommandPaletteOpen(true);
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

  const handleKeyUp = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    selectionRef.current = {
      start: e.currentTarget.selectionStart,
      end: e.currentTarget.selectionEnd,
    };
  }, []);

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
      <CommandPopup
        isOpen={isInlineEditorCommandPaletteOpen}
        inputRef={inputRef}
        selectionRef={selectionRef}
        onCreateNewSubtable={handleCreateNewSubtable}
        menuPositionRef={menuPositionRef}
        onOpenChange={(nextIsOpen) =>
          setInlineEditorCommandPaletteOpen(nextIsOpen)
        }
      />

      <label htmlFor="table-editor-area" className="sr-only">
        Edit the table below. Use <kbd>Ctrl</kbd> + <kbd>/</kbd> to open the
        command palette.
      </label>

      <Textarea
        id="table-editor-area"
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
        onKeyUp={handleKeyUp}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </FlexCol>
  );
}

function CommandPopup({
  isOpen,
  inputRef,
  selectionRef,
  menuPositionRef,
  onOpenChange,
  onCreateNewSubtable,
}: {
  isOpen: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  selectionRef: RefObject<Selection | null>;
  menuPositionRef: RefObject<Caret.Position | null>;
  onOpenChange: (nextIsOpen: boolean) => void;
  onCreateNewSubtable: () => void;
}) {
  const { refs, floatingStyles, context } = useFloating({
    placement: "right-start",
    open: isOpen,
    onOpenChange: (nextIsOpen) => {
      onOpenChange(nextIsOpen);

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
    x: menuPositionRef.current?.left,
    y: menuPositionRef.current?.top,
  });

  const dismiss = useDismiss(context, {
    escapeKey: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    clientPoint,
    dismiss,
  ]);

  return (
    <>
      <div
        className="absolute"
        ref={refs.setReference}
        {...getReferenceProps()}
        style={{
          top: menuPositionRef.current?.top,
          left: menuPositionRef.current?.left,
        }}
      />

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <InlineEditorCommandPalette
                onCreateNewSubtable={onCreateNewSubtable}
              />
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
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
