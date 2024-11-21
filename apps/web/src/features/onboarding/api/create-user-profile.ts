import { getSession } from "@manifold/auth/client";
import { toast } from "@manifold/ui/components/core/toaster";
import { useRef } from "react";

import { useAuth } from "~features/auth/hooks/use-auth";
import { toastError, toastSuccess } from "~utils/toast";
import { trpc } from "~utils/trpc";

export function useCreateUserProfile() {
  const session = useAuth();
  const toastErrorId = useRef<string | number | undefined>(undefined);

  return trpc.user.createProfile.useMutation({
    onSuccess: async () => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      toastSuccess("User profile created");

      /**
       * When the session is revalidated and the user profile is attached, the
       * `protectedLoader` will redirect the user to the dashboard.
       */
      const updatedSession = await getSession({
        event: "invalidate",
        triggerEvent: true,
      });

      await session.update(updatedSession);
    },
    onError: (e) => {
      if (toastErrorId.current) {
        toast.dismiss(toastErrorId.current);
      }

      toastErrorId.current = toastError("Failed to create user profile", {
        description: e.message,
      });
    },
  });
}
