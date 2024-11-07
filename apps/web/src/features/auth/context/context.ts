import type { RouterOutput } from "@manifold/router";
import { createContext } from "react";

type AuthContextType = {
  userProfile: RouterOutput["user"]["profile"] | null;
};

export const AuthContext = createContext<AuthContextType>({
  userProfile: null,
});
