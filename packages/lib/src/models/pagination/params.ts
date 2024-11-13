import { DEFAULT_PER_PAGE } from "./constants";
import { type PaginationMetadata } from "./types";

/**
 * Encapsulates the logic for turning `page` and `perPage` params into
 * offset and limit for database queries.
 */
export class PaginationParamsModel {
  static defaultParams = { page: 1, perPage: DEFAULT_PER_PAGE };

  constructor(
    private page: number,
    private perPage: number,
  ) {}

  private offset() {
    return (this.page - 1) * this.perPage;
  }

  private limit() {
    return this.perPage;
  }

  toQuery() {
    return {
      offset: this.offset(),
      limit: this.limit(),
    };
  }

  toMetadata({ count }: { count: number }): PaginationMetadata {
    return {
      page: this.page,
      perPage: this.perPage,
      totalItems: count,
      totalPages: Math.ceil(count / this.perPage),
    };
  }
}
