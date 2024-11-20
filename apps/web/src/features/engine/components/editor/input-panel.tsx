import { injectNamespacePragmasWorkaround } from "@manifold/lib/utils/engine";
import type { RouterOutput } from "@manifold/router";
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
import { useAtom, useSetAtom } from "jotai";
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
import { GoListUnordered, GoPackageDependencies } from "react-icons/go";
import { Caret } from "textarea-caret-ts";

import { DialogManager, DIALOGS } from "~features/dialog-manager";
import { useResolveDependencies } from "~features/table/api/resolve-dependencies";
import { log } from "~utils/logger";
import { toastSuccess } from "~utils/toast";

import {
  currentAllResolvedDependenciesAtom,
  currentTableDependenciesAtom,
  currentTableHashAtom,
  currentTableMetadataAtom,
  editorStatusAtom,
  rollHistoryAtom,
} from "./state";
import { workerInstance } from "./worker";

type Selection = { start: number; end: number };

type Dependencies = RouterOutput["table"]["get"]["dependencies"];
type FoundDependency = RouterOutput["table"]["findDependencies"][number];

type Props = {
  tableIdentifier: string;
  inputRef: MutableRefObject<HTMLTextAreaElement>;
  refCallback: RefCallBack;
  name: string;
  value: string;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onParseError: (error: string) => void;
  onParseSuccess: (availableTables: string[]) => void;
  initialResolvedDependencies: Dependencies;
};

class MissingDependenciesError extends Error {}

export function InputPanel({
  tableIdentifier,
  inputRef,
  refCallback,
  name,
  value,
  isDisabled,
  onChange,
  onBlur,
  onParseError,
  onParseSuccess,
  initialResolvedDependencies,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Selection | null>(null);
  const menuPositionRef = useRef<Caret.Position | null>(null);
  const setTableHash = useSetAtom(currentTableHashAtom);
  const setEditorStatus = useSetAtom(editorStatusAtom);
  const setRollResults = useSetAtom(rollHistoryAtom);
  const setTableMetadata = useSetAtom(currentTableMetadataAtom);
  const [wantedDependencyIdentifiers, setWantedDependencyIdentifiers] = useAtom(
    currentTableDependenciesAtom,
  );
  const [currentAllResolvedDependencies, setCurrentAllResolvedDependencies] =
    useAtom(currentAllResolvedDependenciesAtom);

  useResolveDependencies({
    dependencies: wantedDependencyIdentifiers,
    onSuccess: (resolvedUpdatedDependencies) => {
      setCurrentAllResolvedDependencies(resolvedUpdatedDependencies);
      parseAndValidate(value, resolvedUpdatedDependencies);
    },
  });

  const [isInlineEditorCommandPaletteOpen, setInlineEditorCommandPaletteOpen] =
    useState(false);

  const parseAndValidate = useCallback(
    async function parseAndValidate(
      value: string,
      updatedResolvedDependencies: Dependencies,
    ) {
      try {
        let availableTables: string[] = [];

        if (!value) {
          setTableHash(null);
          setTableMetadata([]);
        } else {
          setEditorStatus("parsing");

          const valueWithDependencies = injectNamespacePragmasWorkaround(
            value.trim(),
            updatedResolvedDependencies,
          );

          const { hash, metadata, dependencies, missingDependencies } =
            await workerInstance.parse(valueWithDependencies);

          setWantedDependencyIdentifiers(dependencies);

          if (missingDependencies.length > 0) {
            throw new MissingDependenciesError(
              `Missing dependencies: ${missingDependencies.join(", ")}`,
            );
          }

          setEditorStatus("valid");
          setTableHash(hash);
          setTableMetadata(metadata);

          availableTables = metadata
            .filter((m) => m.namespace === undefined)
            .sort((a, b) => (a.export ? -1 : b.export ? 1 : 0))
            .map((m) => m.id);
        }

        onParseSuccess(availableTables);
      } catch (e: unknown) {
        log.error(e);

        if (e instanceof MissingDependenciesError) {
          setEditorStatus("validation_error");
        } else {
          setEditorStatus("parse_error");
        }

        onParseError(String(e));
      }
    },
    [
      onParseSuccess,
      setEditorStatus,
      setWantedDependencyIdentifiers,
      setTableHash,
      setTableMetadata,
      onParseError,
    ],
  );

  const updateValueSelectionAndTable = useCallback(
    (
      currentValue: string,
      selectionStart: number,
      selectionEnd: number,
      dependencies?: Dependencies,
    ) => {
      selectionRef.current = {
        start: selectionStart,
        end: selectionEnd,
      };

      parseAndValidate(
        currentValue,
        dependencies ?? currentAllResolvedDependencies,
      );
      onChange(currentValue);
    },
    [onChange, currentAllResolvedDependencies, parseAndValidate],
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
    const newTable = "---\nid: table\ntitle: Table\n---\n1: variant";
    const modifiedValue = currentValue.length
      ? `${currentValue}\n\n${newTable}`
      : newTable;

    // @XXX: magic numbers that depend on the `newTable` above
    const selectionStart = modifiedValue.length - 33;
    const selectionEnd = selectionStart + 5;

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

  const handleAddDependency = useCallback(
    (dependency: FoundDependency) => {
      let dependencies = currentAllResolvedDependencies;
      const dependenciesToAdd = [dependency, ...dependency.dependencies];

      /**
       * Add the dependency and all of its dependencies to the current list of
       * resolved dependencies. If nothing was added, don't update the state.
       */
      setCurrentAllResolvedDependencies((prev) => {
        const currentDependenciesMap = new Map(prev.map((d) => [d.id, d]));
        const next = [...prev];

        let newDependenciesAdded = false;

        for (const d of dependenciesToAdd) {
          if (!currentDependenciesMap.has(d.id)) {
            next.push(d);
            newDependenciesAdded = true;
          }
        }

        if (!newDependenciesAdded) {
          return prev;
        }

        dependencies = next;
        return dependencies;
      });

      toastSuccess(`Added dependency: ${dependency.tableIdentifier}`);

      // insert text reference into editor
      const currentValue = value.trim();

      if (selectionRef.current) {
        const valuePrefix = currentValue.slice(0, selectionRef.current?.start);
        const valueSuffix = currentValue.slice(selectionRef.current?.end);
        const textToInsert = `{${dependency.tableIdentifier}/${dependency.availableTables[0]}}`;

        updateValueSelectionAndTable(
          `${valuePrefix}${textToInsert}${valueSuffix}`,
          valuePrefix.length,
          valuePrefix.length + textToInsert.length,
          dependencies,
        );
      }
    },
    [
      value,
      currentAllResolvedDependencies,
      setCurrentAllResolvedDependencies,
      updateValueSelectionAndTable,
    ],
  );

  useEffect(() => {
    if (value) {
      setCurrentAllResolvedDependencies(initialResolvedDependencies);
      parseAndValidate(value, initialResolvedDependencies);
    }

    // @TODO: oof, maybe I can put the jotai atoms into a context?
    return () => {
      setRollResults([]);
      setTableHash(null);
      setTableMetadata([]);
      setEditorStatus("initial");
      setWantedDependencyIdentifiers([]);
      setCurrentAllResolvedDependencies([]);
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
        tableIdentifier={tableIdentifier}
        inputRef={inputRef}
        selectionRef={selectionRef}
        onCreateNewSubtable={handleCreateNewSubtable}
        onAddDependency={handleAddDependency}
        menuPositionRef={menuPositionRef}
        onOpenChange={(nextIsOpen) => {
          if (!nextIsOpen) {
            requestAnimationFrame(() => {
              inputRef.current?.focus();

              if (selectionRef.current) {
                inputRef.current?.setSelectionRange(
                  selectionRef.current.start,
                  selectionRef.current.end,
                  "forward",
                );
              }
            });
          }
          setInlineEditorCommandPaletteOpen(nextIsOpen);
        }}
      />

      <label htmlFor="table-editor-area" className="sr-only">
        Edit the table below. Use <kbd>Ctrl</kbd> + <kbd>/</kbd> to open the
        command palette.
      </label>

      <Textarea
        id="table-editor-area"
        className="resize-none bg-background/60 font-mono"
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
        disabled={isDisabled}
      />
    </FlexCol>
  );
}

function CommandPopup({
  isOpen,
  tableIdentifier,
  inputRef,
  selectionRef,
  menuPositionRef,
  onOpenChange,
  onCreateNewSubtable,
  onAddDependency,
}: {
  isOpen: boolean;
  tableIdentifier: string;
  inputRef: RefObject<HTMLTextAreaElement>;
  selectionRef: RefObject<Selection | null>;
  menuPositionRef: RefObject<Caret.Position | null>;
  onOpenChange: (nextIsOpen: boolean) => void;
  onCreateNewSubtable: () => void;
  onAddDependency: (version: FoundDependency) => void;
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
        className="fixed z-50"
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
                tableIdentifier={tableIdentifier}
                onCreateNewSubtable={onCreateNewSubtable}
                onAddDependency={onAddDependency}
              />
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

function InlineEditorCommandPalette({
  tableIdentifier,
  onCreateNewSubtable,
  onAddDependency,
}: {
  tableIdentifier: string;
  onCreateNewSubtable: () => void;
  onAddDependency: (version: FoundDependency) => void;
}) {
  const { onClick, onFocus, onMouseEnter } = DialogManager.dialogButtonProps(
    DIALOGS.FIND_DEPENDENCY.ID,
    {
      tableIdentifier,
      onAddDependency,
    },
  );

  return (
    <Command className="border shadow-lg drop-shadow-lg">
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <CommandInput autoFocus />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandItem onSelect={onCreateNewSubtable}>
            <GoListUnordered className="mr-6 text-accent-foreground" />
            <span>Create a new subtable</span>
          </CommandItem>
          <CommandItem
            onFocus={onFocus}
            onMouseEnter={onMouseEnter}
            onSelect={onClick}
          >
            <GoPackageDependencies className="mr-6 text-accent-foreground" />
            <span>Find a dependency</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
