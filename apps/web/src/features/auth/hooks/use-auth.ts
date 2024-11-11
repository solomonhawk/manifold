import { useSession } from "@manifold/auth/client";
import deepEqual from "fast-deep-equal";
import { useEffect, useState } from "react";

export function useAuth() {
  const currentSession = useSession();
  const [session, setSession] = useState(currentSession);

  useEffect(() => {
    if (
      currentSession.status !== session.status ||
      !deepEqual(currentSession.data, session.data)
    ) {
      setSession(currentSession);
    }
  }, [session, currentSession]);

  return session;
}

export function useRequiredAuth() {
  const session = useAuth();

  if (session.status !== "authenticated") {
    // @TODO: Redirect? This is covered by the `protectedLoader` at the router
    // level so it's kind of redundant here, potentially.
    throw new Error("Authentication required");
  }

  return session;
}
