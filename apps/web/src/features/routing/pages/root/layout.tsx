import { signIn, signOut, useSession } from "@manifold/auth/client";
import { CommandPalette } from "@manifold/ui/components/command-palette";
import { GlobalHeader } from "@manifold/ui/components/global-header";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { Separator } from "@manifold/ui/components/ui/separator";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { Toaster } from "@manifold/ui/components/ui/toaster";
import { useCommandPalette } from "@manifold/ui/hooks/use-command-palette";
import { cn } from "@manifold/ui/lib/utils";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { match } from "ts-pattern";

import { DialogManager } from "~features/dialog-manager";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { RouteMeta } from "~features/routing/components/route-meta";

export function RootLayout() {
  const auth = useSession();
  const [isCommandPaletteOpen, closeCommandPalette] = useCommandPalette();

  const navigate = useNavigate();

  return (
    <DialogManager.Provider>
      <RouteMeta />

      <div className="bg-architect flex h-full flex-col">
        <GlobalHeader.Root>
          <GlobalHeader.Center>
            <Link
              to={auth.status === "authenticated" ? "/dashboard" : "/"}
              className="group flex items-center gap-4"
            >
              <GlobalHeader.LogoMark />

              <Badge size="sm" variant="secondary">
                Alpha
              </Badge>
            </Link>

            <Separator
              orientation="vertical"
              className="h-auto self-stretch bg-foreground/10"
            />

            {auth.status === "authenticated" && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="bg-transparent"
              >
                <PrefetchableLink to="/table/new">
                  Create Table
                </PrefetchableLink>
              </Button>
            )}
          </GlobalHeader.Center>

          <GlobalHeader.Center>
            <PrefetchableLink
              to="/tech-stack"
              className="text-xs text-muted-foreground hover:text-accent-foreground hover:underline focus:text-accent-foreground focus:underline"
            >
              Tech
            </PrefetchableLink>

            {match(auth)
              .with({ status: "loading" }, () => (
                <Skeleton className="size-avatar-sm rounded-full sm:size-avatar" />
              ))
              .with({ status: "unauthenticated" }, () => (
                <GlobalHeader.Unauthed onSignIn={() => signIn("google")} />
              ))
              .with({ status: "authenticated" }, ({ data: session }) => (
                <GlobalHeader.Authed
                  name={session.user.name}
                  image={session.user.image}
                  onSignOut={() => {
                    signOut({ redirect: false });
                  }}
                />
              ))
              .exhaustive()}
          </GlobalHeader.Center>
        </GlobalHeader.Root>

        <Outlet />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          onCreateTable={async () => {
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
          }}
        />

        <Toaster
          cn={cn}
          position="top-center"
          offset={4}
          visibleToasts={1}
          pauseWhenPageIsHidden
        />
      </div>
    </DialogManager.Provider>
  );
}
