import { signIn } from "@manifold/auth/client";
import { FullScreenLoader } from "@manifold/ui/components/full-screen-loader";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function Login() {
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("from") || "/";

  useEffect(() => {
    signIn(undefined, { callbackUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <FullScreenLoader />;
}

export const Component = Login;
