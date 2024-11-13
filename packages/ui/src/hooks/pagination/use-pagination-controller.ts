import {
  type PaginationMetadata,
  PaginationMetadataModel,
} from "@manifold/lib/models/pagination";
import { useMemo } from "react";

import type { Paginator } from "./types";

export type PaginationController = {
  model: PaginationMetadataModel;
  onNext: () => void;
  onPrev: () => void;
  nextPage: () => number;
  prevPage: () => number;
  hasNextPage: () => boolean;
  hasPrevPage: () => boolean;
  jumpTo: (page: number) => void;
  setPerPage: (perPage: number) => void;
};

export function usePaginationController(
  metadata: PaginationMetadata | undefined,
  paginator: Paginator,
): PaginationController {
  const model = useMemo(
    () =>
      new PaginationMetadataModel(
        metadata ?? PaginationMetadataModel.defaultMetadata,
      ),
    [metadata],
  );

  return {
    model,
    onNext: () => {
      paginator.setPage(model.nextPage());
    },
    onPrev: () => {
      paginator.setPage(model.prevPage());
    },
    nextPage: () => model.nextPage(),
    prevPage: () => model.prevPage(),
    hasNextPage: () => model.hasNextPage(),
    hasPrevPage: () => model.hasPrevPage(),
    jumpTo: (page: number) => {
      paginator.setPage(page);
    },
    setPerPage: (perPage: number) => {
      paginator.setPerPage(perPage);
      paginator.setPage(1);
    },
  };
}
