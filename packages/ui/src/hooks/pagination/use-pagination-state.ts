import { PaginationParamsModel } from "@manifold/lib/models/pagination";
import { useMemo, useState } from "react";

import {
  type PaginationState,
  type Paginator,
  PaginatorTypeState,
} from "./types";

const defaultPagination = PaginationParamsModel.defaultParams;

export const usePaginationState = (
  initial?: Partial<PaginationState>,
): [PaginationState, Paginator] => {
  const [page, setPage] = useState<number>(
    initial?.page || defaultPagination.page,
  );
  const [perPage, setPerPage] = useState<number>(
    initial?.perPage || defaultPagination.perPage,
  );

  const paginator = useMemo(
    () => ({
      type: PaginatorTypeState,
      setPage,
      setPerPage,
    }),
    [],
  );

  return useMemo(
    () => [{ page, perPage }, paginator],
    [page, perPage, paginator],
  );
};
