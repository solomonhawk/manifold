import { useSession } from "@manifold/auth/client";
import { Navigate, Outlet } from "react-router-dom";

export function GuestGuard() {
  const { status } = useSession();

  if (status === "loading") {
    // @TODO: better loading state, suspense, router?
    return null;
  }

  if (status === "unauthenticated") {
    return <Outlet />;
  }

  return <Navigate replace to="/dashboard" />;
}
