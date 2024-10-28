import { Slot } from "@radix-ui/react-slot";
import React from "react";

import { cn } from "#lib/utils.ts";

export interface FlexColProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const FlexCol = React.forwardRef<HTMLDivElement, FlexColProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn("flex min-h-0 grow flex-col", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
FlexCol.displayName = "FlexCol";

export { FlexCol };
