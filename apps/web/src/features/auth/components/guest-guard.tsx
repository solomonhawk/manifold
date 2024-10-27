import { useSession } from "@manifold/auth/client";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { Navigate, Outlet } from "react-router-dom";

export function GuestGuard() {
  const { status } = useSession();

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  if (status === "unauthenticated") {
    return <Outlet />;
  }

  return <Navigate replace to="/dashboard" />;
}
