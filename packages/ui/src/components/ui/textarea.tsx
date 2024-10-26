import { useComposedRefs } from "@radix-ui/react-compose-refs";
import autosize from "autosize";
import * as React from "react";

import { cn } from "#lib/utils.ts";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoSize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoSize = false, ...props }, ref) => {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    const combinedRef = useComposedRefs(ref, inputRef);

    React.useEffect(() => {
      const input = inputRef.current;

      if (input && autoSize) {
        autosize(input);

        return () => {
          autosize.destroy(input);
        };
      }
    }, [autoSize]);

    return (
      <textarea
        className={cn(
          "flex min-h-64 w-full rounded-md border border-input bg-transparent px-12 py-8 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
