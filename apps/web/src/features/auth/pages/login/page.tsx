import { signIn } from "@manifold/auth/client";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function Login() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const callbackUrl = params.get("from") || "/";

  useEffect(() => {
    signIn(undefined, { callbackUrl });
  }, []);

  return <FullScreenLoader />;
}

export const Component = Login;
