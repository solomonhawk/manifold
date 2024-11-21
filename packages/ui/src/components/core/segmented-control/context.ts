import { createContext, useContext } from "react";

import type { ButtonProps } from "#components/core/button/button.js";

type SegmentedControlContextValue = {
  id: string;
  size: ButtonProps["size"];
  variant: ButtonProps["variant"];
};

export const SegmentedControlContext =
  createContext<SegmentedControlContextValue | null>(null);

export function useSegmentedControl() {
  const ctx = useContext(SegmentedControlContext);

  if (!ctx) {
    throw new Error(
      "useSegmentedControl must be used within a SegmentedControl",
    );
  }

  return ctx;
}
