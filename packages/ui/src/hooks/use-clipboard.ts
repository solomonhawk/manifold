import { useCallback, useState } from "react";

import { toast } from "#components/ui/toaster.tsx";

function fallbackCopy(text: string) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

export type ClipboardOptions = {
  showToast?: boolean;
  resetDuration?: number;
};

export function useClipboard({
  showToast = true,
  resetDuration = 2000,
}: ClipboardOptions = {}) {
  const [state, setState] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    (value: string) => {
      const handleCopy = async () => {
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            setState(value);
          } else {
            throw new Error("writeText not supported");
          }
        } catch (e) {
          fallbackCopy(value);
          setState(value);
        }

        if (showToast) {
          toast.success("Copied", {
            dismissible: true,
            duration: 2000,
          });
        }

        if (resetDuration) {
          setTimeout(() => {
            setState(null);
          }, resetDuration);
        }
      };

      void handleCopy();
    },
    [resetDuration, showToast],
  );

  return [state !== null, copyToClipboard] as const;
}
