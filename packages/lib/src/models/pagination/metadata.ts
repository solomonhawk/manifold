import type { PaginationMetadata } from "./types";

export class PaginationMetadataModel {
  static defaultMetadata: PaginationMetadata = {
    page: 1,
    perPage: 100,
    totalItems: 0,
    totalPages: 0,
  };

  constructor(private metadata: PaginationMetadata) {}

  get page() {
    return this.metadata.page;
  }

  get perPage() {
    return this.metadata.perPage;
  }

  get totalItems() {
    return this.metadata.totalItems;
  }

  get totalPages() {
    return this.metadata.totalPages;
  }

  currentPageStart() {
    return (this.page - 1) * this.perPage + 1;
  }

  currentPageEnd() {
    return Math.min(this.totalItems, this.page * this.perPage);
  }

  prevPage() {
    return Math.max(1, this.page - 1);
  }

  nextPage() {
    return Math.min(this.totalPages, this.page + 1);
  }

  hasPrevPage() {
    return this.page > 1;
  }

  hasNextPage() {
    return this.page < this.totalPages;
  }
}
