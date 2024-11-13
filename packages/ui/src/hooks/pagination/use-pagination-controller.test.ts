import { PaginationMetadata } from "@manifold/lib/models/pagination";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type Paginator, PaginatorTypeState, usePaginationController } from ".";

function setupHook(initialMetadata?: Partial<PaginationMetadata>) {
  const setPage = vi.fn();
  const setPerPage = vi.fn();

  const metadata = {
    page: 1,
    perPage: 25,
    totalItems: 100,
    totalPages: 4,
    ...initialMetadata,
  } satisfies PaginationMetadata;

  const paginator = {
    type: PaginatorTypeState,
    setPage,
    setPerPage,
  } satisfies Paginator;

  const hook = renderHook(
    ({ metadata, paginator }) => usePaginationController(metadata, paginator),
    {
      initialProps: {
        metadata,
        paginator,
      },
    },
  );

  return {
    ...hook,
    props: {
      metadata,
      paginator,
    },
    setPage,
    setPerPage,
  };
}

describe("usePaginationController", () => {
  it("returns the pagination metadata model and pagination controller api", () => {
    const { result } = setupHook();

    expect(result.current.model).toBeDefined();
  });

  it("onNext() calls `setPage()` with the next `page` value", async () => {
    const { result, setPage } = setupHook();

    result.current.onNext();

    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("onPrev() calls `setPage()` with the prev `page` value", async () => {
    const { result, setPage } = setupHook({
      page: 2,
    });

    result.current.onPrev();

    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("hasNextPage() returns true unless `page` is `totalPages`", async () => {
    const { result, rerender, props } = setupHook({ page: 1, totalPages: 5 });

    expect(result.current.hasNextPage()).toBe(true);

    rerender({ ...props, metadata: { ...props.metadata, page: 5 } });

    expect(result.current.hasNextPage()).toBe(false);
  });

  it("hasPrevPage() returns true unless `page` is 1", async () => {
    const { result, rerender, props } = setupHook({ page: 2 });

    expect(result.current.hasPrevPage()).toBe(true);

    rerender({ ...props, metadata: { ...props.metadata, page: 1 } });

    expect(result.current.hasPrevPage()).toBe(false);
  });

  it("jumpTo() calls `setPage` with the specific page value", async () => {
    const { result, setPage } = setupHook();

    result.current.jumpTo(3);

    expect(setPage).toHaveBeenCalledWith(3);
  });

  it("setPerPage() sets the `perPage` to a specific value", async () => {
    const { result, setPerPage } = setupHook();

    result.current.setPerPage(50);

    expect(setPerPage).toHaveBeenCalledWith(50);
  });
});
