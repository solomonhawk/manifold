import { signIn } from "@manifold/auth/client";
import { useEffect } from "react";

export function Login() {
  useEffect(() => {
    signIn();
  }, []);

  return null;
}

export const Component = Login;
