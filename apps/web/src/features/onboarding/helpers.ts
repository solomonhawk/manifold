import type { useSession } from "@manifold/auth/client";

export function userIsOnboarded(auth: ReturnType<typeof useSession>) {
  return auth.status === "authenticated" && auth.data.userProfile !== null;
}
