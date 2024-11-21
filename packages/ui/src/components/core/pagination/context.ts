import { createContext, useContext } from "react";

import type { PaginationContext } from "./types.ts";

export const PaginationCtx = createContext<PaginationContext | null>(null);

export function usePaginationContext() {
  const ctx = useContext(PaginationCtx);

  if (ctx === null) {
    throw new Error(
      "usePaginationContext must be used within a Pagination.Root",
    );
  }

  return ctx;
}
