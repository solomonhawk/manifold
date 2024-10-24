import { signIn, signOut, useSession } from "@manifold/auth/client";

export function AuthTest() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <button type="button" onClick={() => signIn("google")}>
        Sign in
      </button>
    );
  }

  return (
    <>
      <h1>Welcome back, {session.user.name}</h1>
      <button type="button" onClick={() => signOut({ redirect: false })}>
        Sign Out
      </button>
    </>
  );
}
