import { signIn, signOut, useSession } from "@manifold/auth/client";
import { CommandPalette } from "@manifold/ui/components/command-palette";
import { GlobalHeader } from "@manifold/ui/components/global-header";
import { Button } from "@manifold/ui/components/ui/button";
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
          <Link to="/">
            <GlobalHeader.LogoMark />
          </Link>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="bg-transparent"
          >
            <Link to="/table/new">Create Table</Link>
          </Button>
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
              onSignOut={() =>
                signOut({
                  redirect: false,
                })
              }
            />
          ))
          .exhaustive()}
      </GlobalHeader.Root>

      <Outlet />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        onCreateTable={() => {
          navigate("/table/new");
          closeCommandPalette();
        }}
      />
    </div>
  );
}
