import { slugify } from "@manifold/lib/utils/string";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { motion } from "motion/react";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

import {
  Button,
  type ButtonProps,
  buttonVariants,
} from "#components/core/button/button.js";
import { ButtonGroup } from "#components/core/button-group/button-group.js";
import { Label } from "#components/core/label/label.js";
import {
  RadioGroup,
  type RadioGroupProps,
} from "#components/core/radio-group/radio-group.js";
import {
  SegmentedControlContext,
  useSegmentedControl,
} from "#components/core/segmented-control/context.js";
import { transitionGamma } from "#lib/animation.js";
import { cn } from "#lib/utils.js";

export interface SegmentedControlProps
  extends RadioGroupProps,
    Pick<ButtonProps, "size" | "variant"> {
  children: React.ReactElement<ButtonProps>[];
  orientation?: "horizontal" | "vertical";
}

export const SegmentedControl = forwardRef<
  React.ElementRef<typeof RadioGroup>,
  SegmentedControlProps
>(
  (
    {
      className,
      children,
      defaultValue,
      value,
      onValueChange,
      size,
      variant,
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => {
    if (value !== undefined && onValueChange === undefined) {
      throw new Error(
        "SegmentedControl: If a value is provided, an onValueChange handler must be provided as well",
      );
    }

    if (value !== undefined && defaultValue !== undefined) {
      throw new Error(
        "SegmentedControl: If a value is provided, defaultValue must be undefined",
      );
    }

    const [id] = useState(() => uuid());
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const currentValue = value ?? uncontrolledValue;

    if (currentValue === undefined) {
      throw new Error(
        "SegmentedControl: Either a value or defaultValue must be provided",
      );
    }

    const handleChange = useCallback((next: string) => {
      if (value === undefined) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
    }, []);

    const contextValue = useMemo(() => {
      return {
        id,
        size,
        variant,
      };
    }, [id, size, variant]);

    return (
      <SegmentedControlContext.Provider value={contextValue}>
        <RadioGroup
          ref={ref}
          className={cn(
            buttonVariants({ variant, size }),
            "gap-0 overflow-hidden !p-0",
            {
              "!w-auto": orientation === "horizontal",
              "!h-auto": orientation === "vertical",
            },
            className,
          )}
          value={currentValue}
          onValueChange={handleChange}
          {...props}
        >
          <ButtonGroup
            orientation={orientation}
            // TODO: override divider color based on variant
            className={cn("divide-background/20", {
              "divide-x": orientation === "horizontal",
              "divide-y": orientation === "vertical",
            })}
          >
            {children}
          </ButtonGroup>
        </RadioGroup>
      </SegmentedControlContext.Provider>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

export interface SegmentedControlItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {}

export const SegmentedControlItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  SegmentedControlItemProps
>(({ className, children, value, ...props }, ref) => {
  const { id, size, variant } = useSegmentedControl();
  const itemId = props.id ?? `${id}-${slugify(value)}`;

  return (
    <div className="relative">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        {...props}
        id={itemId}
        className="peer"
      >
        <RadioGroupPrimitive.Indicator>
          <motion.span
            layout
            transition={transitionGamma}
            className={cn("absolute inset-0", indicatorClassName(variant))}
            layoutId={`segmented-${id}-indicator`}
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>

      <Button
        size={size}
        variant={variant}
        asChild
        className={cn(
          // TODO: override checked text color (and hover) based on variant
          "relative z-10 cursor-pointer border-none !bg-transparent peer-data-[state=checked]:!text-background",
          {
            "w-full": size !== "icon" && size !== "icon-sm",
          },
          className,
        )}
      >
        <Label htmlFor={itemId}>{children}</Label>
      </Button>
    </div>
  );
});

SegmentedControlItem.displayName = "SegmentedControlItem";

function indicatorClassName(variant: ButtonProps["variant"]) {
  switch (variant) {
    case "destructive":
      return "bg-destructive-foreground";
    case "destructive-outline":
      return "bg-destructive";
    case "outline":
    case "ghost":
      return "bg-secondary";
    case "secondary":
      return "bg-foreground";
    default:
      return "bg-accent-foreground";
  }
}
