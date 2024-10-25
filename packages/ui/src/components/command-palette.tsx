import { GoFileSymlinkFile } from "react-icons/go";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#components/ui/command.tsx";

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
  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(state) => {
        if (!state) {
          onClose();
        }
      }}
    >
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
