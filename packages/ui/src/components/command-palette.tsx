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
import { useReturnFocus } from "#hooks/use-return-focus.js";

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
  const returnFocus = useReturnFocus(isOpen);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(state) => {
        if (!state) {
          onClose();
          returnFocus();
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
          <CommandItem onSelect={onCreateTable}>
            <GoFileSymlinkFile />
            <span>Create a new Table</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
