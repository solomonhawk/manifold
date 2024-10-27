import { cva, type VariantProps } from "class-variance-authority";
import { RiLoader3Line } from "react-icons/ri";

import { cn } from "#lib/utils.ts";

const loadingIndicatorVariants = cva(undefined, {
  variants: {
    size: {
      default: "size-24",
      xs: "size-12",
      sm: "size-16",
      lg: "size-32",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface LoadingIndicatorProps
  extends VariantProps<typeof loadingIndicatorVariants> {
  className?: string;
  children?: string;
}

export function LoadingIndicator({
  size,
  className,
  children,
}: LoadingIndicatorProps) {
  return (
    <div className={cn(loadingIndicatorVariants({ size }), className)}>
      <RiLoader3Line className="size-full animate-spin" />
      <span className="sr-only">{children || "Loading"}</span>
    </div>
  );
}
