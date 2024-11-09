import { useSession } from "@manifold/auth/client";
import { useMemo } from "react";

export function useAuth() {
  return useSession();
}

export function useRequiredAuth() {
  const session = useSession();

  if (session.status !== "authenticated") {
    // @TODO: Redirect? This is covered by the `protectedLoader` at the router
    // level so it's kind of redundant here, potentially.
    throw new Error("Authentication required");
  }

  return useMemo(() => session, [session]);
}
