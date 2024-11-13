export const PaginatorTypeState = "state" as const;
export const PaginatorTypeURL = "url" as const;

export type PaginatorType = typeof PaginatorTypeState | typeof PaginatorTypeURL;

export type PaginationState = {
  page: number;
  perPage: number;
};

export interface Paginator {
  type: PaginatorType;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
}
