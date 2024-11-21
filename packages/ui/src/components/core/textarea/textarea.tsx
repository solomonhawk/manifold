import { useComposedRefs } from "@radix-ui/react-compose-refs";
import autosize from "autosize";
import React, { forwardRef, useEffect, useRef } from "react";

import { cn } from "#lib/utils.js";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoSize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize = false, ...props }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const combinedRef = useComposedRefs(ref, inputRef);

    useEffect(() => {
      const input = inputRef.current;

      if (!(input && autoSize)) {
        return;
      }

      autosize(input);

      return () => {
        autosize.destroy(input);
      };
    }, [autoSize]);

    return (
      <textarea
        className={cn(
          "flex min-h-64 w-full rounded border border-input bg-transparent px-12 py-8 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={combinedRef}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
