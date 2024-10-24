import { signIn, signOut, useSession } from "@manifold/auth/client";
import { GlobalHeader } from "@manifold/ui/components/global-header";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { Outlet } from "react-router-dom";
import { match } from "ts-pattern";

export function RootLayout() {
  const auth = useSession();

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
    </div>
  );
}
