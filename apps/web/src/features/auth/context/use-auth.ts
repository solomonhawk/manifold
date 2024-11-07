import { useSession } from "@manifold/auth/client";
import { useContext, useMemo } from "react";

import { AuthContext } from "~features/auth/context/context";

export function useAuth() {
  const session = useSession();
  const { userProfile } = useContext(AuthContext);

  return useMemo(
    () => ({
      userProfile,
      session,
    }),
    [userProfile, session],
  );
}

export function useRequiredAuth() {
  const session = useSession();
  const { userProfile } = useContext(AuthContext);

  if (session.status !== "authenticated") {
    // @TODO: Redirect? This is covered by the `protectedLoader` at the router
    // level so it's kind of redundant here, potentially.
    throw new Error("Authentication required");
  }

  return useMemo(
    () => ({
      userProfile,
      session,
    }),
    [userProfile, session],
  );
}
