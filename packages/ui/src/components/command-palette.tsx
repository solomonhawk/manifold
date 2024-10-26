import { useEffect, useRef } from "react";
import { GoFileSymlinkFile } from "react-icons/go";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#components/ui/command.tsx";
import { DialogDescription, DialogTitle } from "#components/ui/dialog.tsx";

// @TODO: Make this more generic, pass in a list of command groups, etc.
export function CommandPalette({
  isOpen,
  onClose,
  onCreateTable,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateTable: () => void;
}) {
  const shouldReturnFocus = useRef(true);
  const focusedSource = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && !focusedSource.current) {
      focusedSource.current = document.activeElement as HTMLElement;
    }

    return () => {
      focusedSource.current = null;
    };
  }, [isOpen]);

  function returnFocusToSource() {
    const elementToFocus = focusedSource.current;

    if (elementToFocus) {
      requestAnimationFrame(() => {
        elementToFocus.focus();
      });
    }

    focusedSource.current = null;
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(state) => {
        if (!state) {
          onClose();
          returnFocusToSource();
        }
      }}
    >
      <span className="sr-only">
        <DialogTitle>Command Launcher</DialogTitle>
        <DialogDescription>Quickly find common actions</DialogDescription>
      </span>

      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem
            onSelect={() => {
              shouldReturnFocus.current = false;
              onCreateTable();
            }}
          >
            <GoFileSymlinkFile />
            <span>Create a new Table</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
