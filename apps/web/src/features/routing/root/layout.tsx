import { signIn, signOut, useSession } from "@manifold/auth/client";
import { CommandPalette } from "@manifold/ui/components/command-palette";
import { GlobalHeader } from "@manifold/ui/components/global-header";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { Separator } from "@manifold/ui/components/ui/separator";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { useCommandPalette } from "@manifold/ui/hooks/use-command-palette";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { match } from "ts-pattern";

export function RootLayout() {
  const auth = useSession();
  const [isCommandPaletteOpen, closeCommandPalette] = useCommandPalette();

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-architect">
      <GlobalHeader.Root>
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-4 group">
            <GlobalHeader.LogoMark />

            <Badge size="sm" variant="secondary">
              Alpha
            </Badge>
          </Link>

          <Separator
            orientation="vertical"
            className="bg-foreground/10 self-stretch h-auto"
          />

          {auth.status === "authenticated" && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="bg-transparent"
            >
              <Link to="/table/new">Create Table</Link>
            </Button>
          )}
        </div>

        {match(auth)
          .with({ status: "loading" }, () => (
            <Skeleton className="rounded-full size-avatar-sm sm:size-avatar" />
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
    </div>
  );
}
