import * as React from "react";

import { cn } from "#lib/utils.ts";

export interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, inputProps, startAdornment, endAdornment, id, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "flex h-36 w-full rounded border border-input bg-transparent text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
        aria-describedby={undefined}
        aria-invalid={undefined}
      >
        {startAdornment}
        <input
          id={id}
          className="size-full bg-transparent px-12 py-4 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground"
          ref={ref}
          {...inputProps}
          aria-describedby={props["aria-describedby"]}
          aria-invalid={props["aria-invalid"]}
        />
        {endAdornment}
      </div>
    );
  },
);
Input.displayName = "Input";

type InputAdornmentProps = React.HTMLAttributes<HTMLDivElement>;

const InputAdornment = React.forwardRef<HTMLDivElement, InputAdornmentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full min-w-36 items-center justify-center text-sm",
          className,
        )}
        {...props}
      />
    );
  },
);
InputAdornment.displayName = "InputAdornment";

export { Input, InputAdornment };
