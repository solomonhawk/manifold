import { PaginationParamsModel } from "@manifold/lib/models/pagination";
import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  type PaginationState,
  type Paginator,
  PaginatorTypeURL,
} from "./types";

const defaultPagination = PaginationParamsModel.defaultParams;

/**
 * @NOTE(shawk): react-router's `useSearchParams` hook doesn't allow multiple
 * separate calls to `setSearchParams` in the same render cycle using the
 * functional callback style (each will see the current params, not the
 * transiently updated value).
 *
 * Ref: https://github.com/remix-run/react-router/issues/9757
 */
export interface URLPaginator extends Paginator {
  updatePageParam: (params: URLSearchParams, page: number) => void;
  updatePerPageParam: (params: URLSearchParams, perPage: number) => void;
  getSearchParams: (page: number) => URLSearchParams;
}

export function isUrlPaginator(
  paginator: Paginator,
): paginator is URLPaginator {
  return paginator.type === PaginatorTypeURL;
}

export const usePaginationURLState = (
  initial?: Partial<PaginationState>,
): [PaginationState, URLPaginator] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const paramsPage = searchParams.get("page");
  const paramsPerPage = searchParams.get("perPage");

  // Fetch state from URL params
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial is not stable
  const paginationState = useMemo(() => {
    const page = paramsPage ?? initial?.page ?? defaultPagination.page;
    const perPage =
      paramsPerPage ?? initial?.perPage ?? defaultPagination.perPage;

    return {
      page: Number.parseInt(String(page), 10),
      perPage: Number.parseInt(String(perPage), 10),
    };
  }, [paramsPage, paramsPerPage]);

  // Set initial pagination URL params if not set
  useEffect(() => {
    if (searchParams.has("page") && searchParams.has("perPage")) {
      return;
    }

    setSearchParams(
      (params) => {
        params.set("page", String(paginationState.page));
        params.set("perPage", String(paginationState.perPage));

        return params;
      },
      { replace: true },
    );
  }, [paginationState, searchParams, setSearchParams]);

  const updatePageParam = useCallback(
    (params: URLSearchParams, page: number) => {
      params.set("page", String(page));
    },
    [],
  );

  const updatePerPageParam = useCallback(
    (params: URLSearchParams, perPage: number) => {
      params.set("perPage", String(perPage));
    },
    [],
  );

  return useMemo(
    () => [
      paginationState,
      {
        type: PaginatorTypeURL,
        setPage: (page: number) => {
          setSearchParams((params) => {
            updatePageParam(params, page);
            return params;
          });
        },
        setPerPage: (perPage: number) => {
          setSearchParams((params) => {
            updatePerPageParam(params, perPage);
            return params;
          });
        },
        updatePageParam,
        updatePerPageParam,
        getSearchParams: (page: number) => {
          const params = new URLSearchParams(searchParams);
          params.set("page", String(page));
          return params;
        },
      },
    ],
    [
      paginationState,
      searchParams,
      setSearchParams,
      updatePageParam,
      updatePerPageParam,
    ],
  );
};
