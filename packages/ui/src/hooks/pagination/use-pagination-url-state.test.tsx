import { act, renderHook, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { usePaginationURLState } from "./use-pagination-url-state";

function renderHookWithRouter<Result, Props>(
  render: (initialProps: Props) => Result,
  initialRoute = "/",
) {
  let router: ReturnType<typeof createMemoryRouter> | null = null;

  function RouterWrapper({ children }: { children?: React.ReactNode }) {
    const routes = [
      {
        element: <>{children}</>,
        path: "/",
      },
    ];

    router = createMemoryRouter(routes, {
      initialEntries: [initialRoute],
    });

    return <RouterProvider router={router} />;
  }

  const hook = renderHook(render, {
    wrapper: RouterWrapper,
  });

  return {
    router: router as unknown as ReturnType<typeof createMemoryRouter>,
    hook,
  };
}

describe("usePaginationURLState", () => {
  describe("when the query string is empty", () => {
    it("returns default values", () => {
      const {
        hook: { result },
      } = renderHookWithRouter(() => usePaginationURLState());

      const [paginationState, _paginator] = result.current;

      expect(paginationState).toEqual({
        page: 1,
        perPage: 25,
      });
    });

    it("sets `page` and `perPage` URL params", async () => {
      const { router } = renderHookWithRouter(() => usePaginationURLState());

      await waitFor(() => {
        expect(router?.state.location.search).toBe("?page=1&perPage=25");
      });
    });
  });

  describe("when the query string is not empty", () => {
    it("parses `page`, `perPage`, `query`, and `sort` URL params", () => {
      const {
        hook: { result },
      } = renderHookWithRouter(
        () => usePaginationURLState(),
        "/?page=3&perPage=10",
      );

      const [paginationState, _paginator] = result.current;

      expect(paginationState).toEqual({
        page: 3,
        perPage: 10,
      });
    });
  });

  describe("setPage()", () => {
    it("updates the `page` param in the URL", async () => {
      const {
        router,
        hook: { result },
      } = renderHookWithRouter(
        () => usePaginationURLState(),
        "/?page=1&perPage=10",
      );

      const [_paginationState, paginator] = result.current;

      act(() => {
        paginator.setPage(3);
      });

      await waitFor(() => {
        expect(router?.state.location.search).toBe("?page=3&perPage=10");
      });
    });
  });

  describe("setPerPage()", () => {
    it("updates the `perPage` param in the URL", async () => {
      const {
        router,
        hook: { result },
      } = renderHookWithRouter(
        () => usePaginationURLState(),
        "/?page=1&perPage=10",
      );

      const [_paginationState, paginator] = result.current;

      act(() => {
        paginator.setPerPage(50);
      });

      await waitFor(() => {
        expect(router?.state.location.search).toBe("?page=1&perPage=50");
      });
    });
  });

  describe("updatePageParam()", () => {
    it("updates the `page` param and returns URLSearchParams", async () => {
      const {
        router,
        hook: { result },
      } = renderHookWithRouter(() => usePaginationURLState());

      const [_paginationState, paginator] = result.current;
      const params = new URLSearchParams(router?.state.location.search);

      paginator.updatePageParam(params, 2);

      expect(params.get("page")).toBe("2");
    });
  });

  describe("updatePerPageParam()", () => {
    it("updates the `perPage` param and returns URLSearchParams", async () => {
      const {
        router,
        hook: { result },
      } = renderHookWithRouter(() => usePaginationURLState());

      const [_paginationState, paginator] = result.current;
      const params = new URLSearchParams(router?.state.location.search);

      paginator.updatePerPageParam(params, 50);

      expect(params.get("perPage")).toBe("50");
    });
  });
});
