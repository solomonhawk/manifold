import { forwardRef, type MouseEvent } from "react";

import { Button, type ButtonProps } from "#components/ui/button.tsx";
import { cn } from "#lib/utils.ts";

type ReactiveButtonProps = Omit<ButtonProps, "variant" | "onMouseMove"> & {
  reactive?: boolean;
};

const ReactiveButton = forwardRef<HTMLButtonElement, ReactiveButtonProps>(
  ({ className, children, reactive = true, ...props }, ref) => {
    function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
      const x = e.pageX - e.currentTarget.offsetLeft;
      const y = e.pageY - e.currentTarget.offsetTop;

      e.currentTarget.style.setProperty("--x", `${x}px`);
      e.currentTarget.style.setProperty("--y", `${y}px`);
    }

    return (
      <Button
        ref={ref}
        className={cn(
          {
            "border-reactive": reactive,
          },
          className,
        )}
        onMouseMove={handleMouseMove}
        type="button"
        {...props}
      >
        {children}
      </Button>
    );
  },
);
ReactiveButton.displayName = "ReactiveButton";

export { ReactiveButton };
