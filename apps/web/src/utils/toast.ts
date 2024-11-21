import {
  type ExternalToast,
  toast,
} from "@manifold/ui/components/core/toaster";

export function toastSuccess(message: string, options?: ExternalToast) {
  return toast.success(message, {
    duration: 3000,
    dismissible: true,
    ...options,
  });
}

export function toastError(message: string, options?: ExternalToast) {
  return toast.error(message, {
    dismissible: true,
    closeButton: true,
    important: true,
    duration: Infinity,
    ...options,
  });
}
