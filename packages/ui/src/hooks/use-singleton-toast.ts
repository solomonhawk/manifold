import { useCallback, useMemo, useRef } from "react";

import { toast } from "#components/ui/toaster.tsx";

type ToastId = string | number | undefined;

export function useSingletonToast() {
  const toastId = useRef<ToastId>(undefined);

  const dismiss = useCallback(() => {
    if (toastId.current) {
      toast.dismiss(toastId.current);
    }
  }, []);

  const update = useCallback((id: ToastId) => {
    dismiss();
    toastId.current = id;
  }, []);

  return useMemo(() => {
    return {
      dismiss,
      update,
    };
  }, []);
}
