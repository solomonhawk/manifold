import { type ExternalToast, toast, Toaster as Sonner } from "sonner";

import { cn } from "#lib/utils.ts";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className={cn("toaster group", className)}
      style={{
        "--toast-close-button-start": "unset",
        "--toast-close-button-end": "unset",
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast flex items-center group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:rounded-sm group-[.toaster]:shadow-lg px-12 py-10 text-xs",
          description: "group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:shrink-0 group-[.toast]:relative group-[.toast]:order-2 group-[.toast]:ml-auto group-[.toast]:transform-none group-[.toast]:hover:text-background group-[.toast]:transition-colors",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export type { ExternalToast };
export { toast, Toaster };
