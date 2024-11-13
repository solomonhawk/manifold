import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePaginationState } from "./use-pagination-state";

describe("usePaginationState", () => {
  describe("when initial state is empty", () => {
    it("returns default values", () => {
      const { result } = renderHook(() => usePaginationState());
      const [paginationState, _paginator] = result.current;

      expect(paginationState.page).toBe(1);
      expect(paginationState.perPage).toBe(25);
    });
  });

  describe("with initial state", () => {
    it("returns the initial state", () => {
      const { result } = renderHook(() =>
        usePaginationState({ page: 3, perPage: 10 }),
      );
      const [paginationState, _paginator] = result.current;

      expect(paginationState.page).toBe(3);
      expect(paginationState.perPage).toBe(10);
    });
  });

  describe("setPage()", () => {
    it("sets the `page` value", async () => {
      const { result, rerender } = renderHook(() => usePaginationState());
      const [_paginationState, paginator] = result.current;

      await act(() => {
        paginator.setPage(3);
      });

      rerender();

      const [paginationState] = result.current;
      expect(paginationState.page).toBe(3);
    });
  });

  describe("setPerPage()", () => {
    it("sets the `perPage` value", async () => {
      const { result, rerender } = renderHook(() => usePaginationState());
      const [_paginationState, paginator] = result.current;

      await act(() => {
        paginator.setPerPage(10);
      });

      rerender();

      const [paginationState] = result.current;
      expect(paginationState.perPage).toBe(10);
    });
  });
});
