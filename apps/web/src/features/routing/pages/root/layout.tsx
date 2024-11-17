import { signIn, signOut } from "@manifold/auth/client";
import { GlobalHeader } from "@manifold/ui/components/global-header";
import { Badge } from "@manifold/ui/components/ui/badge";
import { Button } from "@manifold/ui/components/ui/button";
import { Separator } from "@manifold/ui/components/ui/separator";
import { Skeleton } from "@manifold/ui/components/ui/skeleton";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { match } from "ts-pattern";

import { useAuth } from "~features/auth/hooks/use-auth";
import { DialogManager } from "~features/dialog-manager";
import { Launcher } from "~features/routing/components/launcher";
import { PrefetchableLink } from "~features/routing/components/prefetchable-link";
import { RouteMeta } from "~features/routing/components/route-meta";

export function RootLayout() {
  const session = useAuth();

  return (
    <DialogManager.Provider>
      <RouteMeta />
      <ScrollRestoration />

      <div
        className="bg-architect flex h-full flex-col"
        data-vaul-drawer-wrapper
      >
        <GlobalHeader.Root>
          <GlobalHeader.Center>
            <PrefetchableLink
              to={session.status === "authenticated" ? "/dashboard" : "/"}
              className="group flex items-center gap-4"
            >
              <GlobalHeader.LogoMark />

              <Badge size="sm" variant="secondary">
                Alpha
              </Badge>
            </PrefetchableLink>

            <Separator
              orientation="vertical"
              className="h-auto self-stretch bg-foreground/10"
            />

            {session.status === "authenticated" && (
              <Button asChild size="sm">
                <PrefetchableLink to="/table/new">
                  Create Table
                </PrefetchableLink>
              </Button>
            )}

            <Button
              asChild
              size="sm"
              variant="outline"
              className="bg-transparent"
            >
              <PrefetchableLink to="/table/discover">Discover</PrefetchableLink>
            </Button>

            <Button asChild size="sm" variant="link">
              <PrefetchableLink to="/tech-stack">Tech</PrefetchableLink>
            </Button>
          </GlobalHeader.Center>

          <GlobalHeader.Center>
            {match(session)
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

        <Launcher />
      </div>
    </DialogManager.Provider>
  );
}
