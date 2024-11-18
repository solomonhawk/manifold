import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "#lib/utils.ts";

const noticeVariants = cva(
  "flex gap-12 rounded border p-12 text-sm sm:gap-16 sm:p-16",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        info: "border-accent-foreground text-accent-foreground",
        error: "border-destructive text-destructive-foreground",
        loud: "text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface NoticeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noticeVariants> {
  asChild?: boolean;
}

const Notice = React.forwardRef<HTMLDivElement, NoticeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn("shrink-0", noticeVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Notice.displayName = "Notice";

type NoticeIconProps = {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
};

const NoticeIcon = React.forwardRef<HTMLDivElement, NoticeIconProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return <Comp className={cn("shrink-0", className)} ref={ref} {...props} />;
  },
);
NoticeIcon.displayName = "NoticeIcon";

type NoticeContentProps = {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
};

const NoticeContent = React.forwardRef<HTMLDivElement, NoticeContentProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp className={cn("-mt-3 w-full", className)} ref={ref} {...props} />
    );
  },
);
NoticeContent.displayName = "NoticeContent";

export { Notice, NoticeContent, NoticeIcon };
