import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "#lib/utils.ts";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-8 whitespace-nowrap rounded-sm text-sm ring-0 ring-offset-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 highlighted:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 highlighted:bg-destructive/90",
        "destructive-outline":
          "border border-destructive/30 text-destructive shadow-sm hover:bg-destructive/90 hover:text-destructive-foreground highlighted:bg-destructive/90 highlighted:text-destructive-foreground",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground highlighted:bg-accent highlighted:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 highlighted:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground highlighted:bg-accent highlighted:text-accent-foreground",
        link: "text-primary decoration-current decoration-from-font underline-offset-2 hover:underline highlighted:underline",
      },
      size: {
        default: "h-36 px-16 py-8",
        sm: "h-28 rounded-sm px-10 text-xs sm:h-32 sm:px-12",
        lg: "h-40 rounded-sm px-32",
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

interface ButtonGroupProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  children: React.ReactElement<ButtonProps>[];
}

function ButtonGroup({
  className,
  orientation = "horizontal",
  children,
}: ButtonGroupProps) {
  const totalButtons = React.Children.count(children);
  const isHorizontal = orientation === "horizontal";
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex",
        {
          "flex-col": isVertical,
          "w-fit": isVertical,
        },
        className,
      )}
    >
      {React.Children.map(children, (child, index) => {
        const isFirst = index === 0;
        const isLast = index === totalButtons - 1;

        return React.cloneElement(child, {
          className: cn(
            {
              "rounded-l-none": isHorizontal && !isFirst,
              "rounded-r-none": isHorizontal && !isLast,
              "border-l-0": isHorizontal && !isFirst,

              "rounded-t-none": isVertical && !isFirst,
              "rounded-b-none": isVertical && !isLast,
              "border-t-0": isVertical && !isFirst,
            },
            child.props.className,
          ),
        });
      })}
    </div>
  );
}

export { Button, ButtonGroup, buttonVariants };
