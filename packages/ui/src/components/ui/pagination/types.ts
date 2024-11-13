import type { PaginationMetadata } from "@manifold/lib/models/pagination";

import type { Paginator } from "#hooks/pagination/types.ts";
import type { PaginationController } from "#hooks/pagination/use-pagination-controller.ts";

export type PaginationProps = {
  metadata: PaginationMetadata;
  paginator: Paginator;
  children?: React.ReactNode;
};

export type PaginationContext = {
  controller: PaginationController;
  paginator: Paginator;
};
