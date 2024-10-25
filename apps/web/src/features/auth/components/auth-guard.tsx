import { useSession } from "@manifold/auth/client";
import { LoadingIndicator } from "@manifold/ui/components/loading-indicator";
import { FlexCol } from "@manifold/ui/components/ui/flex";
import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <FlexCol className="items-center justify-center">
        <LoadingIndicator />
      </FlexCol>
    );
  }

  if (status === "authenticated") {
    return <Outlet />;
  }

  return <Navigate replace to="/" />;
}
