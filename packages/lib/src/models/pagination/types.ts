export type PaginationMetadata = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type WithPagination<T> = {
  data: T[];
  pagination: PaginationMetadata;
};

export type PaginationParams = {
  page: number;
  perPage: number;
};
