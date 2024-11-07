import { useSession } from "@manifold/auth/client";
import { useMemo } from "react";

import { AuthContext } from "~features/auth/context/context";
import { trpc } from "~utils/trpc";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  const userProfileQuery = trpc.user.profile.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const value = useMemo(
    () => ({ userProfile: userProfileQuery.data ?? null }),
    [userProfileQuery.data],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
