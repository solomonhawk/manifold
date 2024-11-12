import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { Outlet } from "react-router-dom";

import { useAuth } from "~features/auth/hooks/use-auth";

export function AuthGuard() {
  const session = useAuth();

  if (session.status === "loading") {
    return <FullScreenLoader />;
  }

  return <Outlet />;
}
