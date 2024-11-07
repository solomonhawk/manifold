import { CommandPalette } from "@manifold/ui/components/command-palette";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@manifold/ui/components/ui/command";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { useCommandPalette } from "@manifold/ui/hooks/use-command-palette";
import { GoFile, GoFileSymlinkFile } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";

import { useListTables } from "~features/table/api/list";

export function Launcher() {
  const [isCommandPaletteOpen, closeCommandPalette] = useCommandPalette();
  const navigate = useNavigate();

  // @TODO: maybe only fetch like 10 tables? re-fetch when search input changes
  const tablesQuery = useListTables({
    orderBy: "recently_edited",
    options: { enabled: isCommandPaletteOpen },
  });

  function handleCreateTable() {
    closeCommandPalette();

    /**
     * @NOTE: Give the dialog a chance to close before navigating so that
     * `autoFocus` works as expected on the subsequent page.
     *
     * This raises a warning in the console related to
     * `@radix-ui/react-dialog` calling `hideOthers` from the
     * `aria-hidden` package which sets `aria-hidden` on the body element.
     *
     * > Blocked aria-hidden on an element because its descendant retained
     * > focus. The focus must not be hidden from assistive technology
     * > users. Avoid using aria-hidden on a focused element or its
     * > ancestor. Consider using the inert attribute instead, which will
     * > also prevent focus.
     *
     * That package supports `inert`, but it hasn't been adopted by Radix
     * as of right now.
     */
    requestAnimationFrame(() => {
      navigate("/table/new");
    });
  }

  return (
    <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette}>
      <CommandGroup heading="Quick Actions">
        <CommandItem onSelect={handleCreateTable}>
          <GoFileSymlinkFile />
          <span>Create a new Table</span>
          <CommandShortcut>⌘E</CommandShortcut>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup heading="Your Tables">
        {tablesQuery.isLoading && (
          <div className="space-y-8">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        )}

        {!tablesQuery.isLoading &&
          tablesQuery.data?.map((table) => {
            return (
              <CommandItem
                key={table.id}
                asChild
                onSelect={() => {
                  navigate(`/table/${table.id}/edit`);
                  closeCommandPalette();
                }}
              >
                <Link to={`/table/${table.id}/edit`}>
                  <GoFile />
                  <span>{table.title}</span>
                </Link>
              </CommandItem>
            );
          })}
      </CommandGroup>
    </CommandPalette>
  );
}
