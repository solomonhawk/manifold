import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "#components/core/command/command.js";
import {
  DialogDescription,
  DialogTitle,
} from "#components/core/dialog/dialog.js";
import { useReturnFocus } from "#hooks/use-return-focus.ts";

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
