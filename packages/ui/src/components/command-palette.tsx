import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "#components/ui/command.tsx";
import { DialogDescription, DialogTitle } from "#components/ui/dialog.tsx";
import { useReturnFocus } from "#hooks/use-return-focus.js";

export function CommandPalette({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
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
        {children}
      </CommandList>
    </CommandDialog>
  );
}
