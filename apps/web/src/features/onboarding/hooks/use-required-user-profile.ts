import { useRequiredAuth } from "~features/auth/hooks/use-auth";

export function useRequiredUserProfile() {
  const { data } = useRequiredAuth();

  if (!data.userProfile) {
    throw new Error("Onboarding required");
  }

  return data.userProfile;
}
