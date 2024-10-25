import { signIn, signOut, useSession } from "@manifold/auth/client";
import { CommandPalette } from "@manifold/ui/components/command-palette";
import { GlobalHeader } from "@manifold/ui/components/global-header";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { useCommandPalette } from "@manifold/ui/hooks/use-command-palette";
import { Outlet, useNavigate } from "react-router-dom";
import { match } from "ts-pattern";

export function RootLayout() {
  const auth = useSession();
  const [isCommandPaletteOpen, closeCommandPalette] = useCommandPalette();

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-architect">
      <GlobalHeader.Root>
        <GlobalHeader.LogoMark />
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
          navigate("/tables/new");
          closeCommandPalette();
        }}
      />
    </div>
  );
}
