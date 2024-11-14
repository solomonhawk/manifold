import { CommandPalette } from "@manifold/ui/components/command-palette";
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@manifold/ui/components/ui/command";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { useCommandPalette } from "@manifold/ui/hooks/use-command-palette";
import { GoFile, GoHome, GoListUnordered, GoSearch } from "react-icons/go";
import {
  Link,
  type NavigateOptions,
  type To,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "~features/auth/hooks/use-auth";
import { useListTables } from "~features/table/api/list";

export function Launcher() {
  const session = useAuth();
  const [isCommandPaletteOpen, closeCommandPalette] = useCommandPalette();
  const navigate = useNavigate();

  // @TODO: maybe only fetch like 10 tables? re-fetch when search input changes
  const tablesQuery = useListTables({
    orderBy: "recently_edited",
    options: {
      enabled: isCommandPaletteOpen && session.status === "authenticated",
    },
  });

  function navigateAndDismissLauncher(to: To, options?: NavigateOptions) {
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
      navigate(to, options);
    });
  }

  const username = session.data?.userProfile?.username;

  return (
    <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette}>
      <CommandGroup heading="Quick Actions">
        <CommandItem
          asChild
          onSelect={() => {
            navigateAndDismissLauncher("/table/new");
          }}
        >
          <Link to="/table/new">
            <GoListUnordered className="text-accent-foreground" />
            <span>Create a new Table</span>
          </Link>
        </CommandItem>

        <CommandItem
          asChild
          onSelect={() => {
            navigateAndDismissLauncher("/");
          }}
        >
          <Link to="/">
            <GoHome className="text-accent-foreground" />
            <span>Dashboard</span>
          </Link>
        </CommandItem>

        <CommandItem
          asChild
          onSelect={() => {
            navigateAndDismissLauncher("/table/discover");
          }}
        >
          <Link to="/table/discover">
            <GoSearch className="text-accent-foreground" />
            <span>Discover</span>
          </Link>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      {session.status === "authenticated" && (
        <CommandGroup heading="Your Tables">
          {tablesQuery.isLoading && (
            <div className="space-y-8">
              <Skeleton className="h-44" />
            </div>
          )}

          {username &&
            !tablesQuery.isLoading &&
            tablesQuery.data?.map((table) => {
              return (
                <CommandItem
                  key={table.id}
                  asChild
                  onSelect={() => {
                    navigateAndDismissLauncher(
                      `/t/${username}/${table.slug}/edit`,
                    );
                  }}
                >
                  <Link to={`/t/${username}/${table.slug}/edit`}>
                    <GoFile />
                    <span>{table.title}</span>
                  </Link>
                </CommandItem>
              );
            })}
        </CommandGroup>
      )}
    </CommandPalette>
  );
}
