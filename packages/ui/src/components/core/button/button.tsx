import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "#lib/utils.js";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-8 whitespace-nowrap rounded-sm text-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow",
        destructive: "bg-destructive text-destructive-foreground shadow-sm",
        "destructive-outline":
          "border border-destructive/30 text-destructive shadow-sm",
        outline: "border border-input bg-background shadow-sm",
        secondary: "bg-secondary text-secondary-foreground shadow-sm",
        ghost: "",
        link: "text-primary decoration-current decoration-from-font underline-offset-2",
      },
      size: {
        default: "h-36 px-16 py-8",
        sm: "h-28 px-10 text-xs sm:h-32 sm:px-12",
        lg: "h-40 rounded px-32",
        "icon-sm": "size-28 sm:size-32",
        icon: "size-36",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const buttonInteractionVariants = cva(
  "ring-0 ring-offset-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "hover:bg-primary/90 highlighted:bg-primary/90",
        destructive: "hover:bg-destructive/90 highlighted:bg-destructive/90",
        "destructive-outline":
          "hover:bg-destructive/90 hover:text-destructive-foreground highlighted:bg-destructive/90 highlighted:text-destructive-foreground",
        outline:
          "hover:bg-accent hover:text-accent-foreground highlighted:bg-accent highlighted:text-accent-foreground",
        secondary: "hover:bg-secondary/80 highlighted:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground highlighted:bg-accent highlighted:text-accent-foreground",
        link: "hover:underline highlighted:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          buttonInteractionVariants({ variant }),
        )}
        ref={ref}
        type="button"
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
