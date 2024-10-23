import { signIn, signOut, useSession } from "@manifold/auth/client";

export function AuthTest() {
  const { data: session, status } = useSession();

  console.log(session, status);

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return (
      <button type="button" onClick={() => signIn("google")}>
        Sign in
      </button>
    );
  }

  return (
    <button type="button" onClick={() => signOut({ redirect: false })}>
      Sign Out
    </button>
  );
}
