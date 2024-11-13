import { describe, expect, it } from "vitest";

import { PaginationMetadataModel } from "./metadata";
import type { PaginationMetadata } from "./types";

describe("PaginationMetadataModel", () => {
  function buildModel(metadata: Partial<PaginationMetadata>) {
    return new PaginationMetadataModel({
      page: 1,
      perPage: 10,
      totalItems: 27,
      totalPages: 3,
      ...metadata,
    });
  }
  describe("currentPageStart()", () => {
    it("returns the first result number on a given page", () => {
      const cases = [
        [1, 1],
        [2, 11],
        [3, 21],
      ];

      for (const [page, expected] of cases) {
        const subject = buildModel({ page });

        expect(subject.currentPageStart()).toEqual(expected);
      }
    });
  });

  describe("currentPageEnd()", () => {
    it("returns the last result number on a given page", () => {
      const cases = [
        [1, 10],
        [2, 20],
        [3, 27],
      ];

      for (const [page, expected] of cases) {
        const subject = buildModel({ page });

        expect(subject.currentPageEnd()).toEqual(expected);
      }
    });
  });

  describe("prevPage()", () => {
    describe("page is not first page", () => {
      it("returns the previous page", () => {
        const subject = buildModel({ page: 3 });

        expect(subject.prevPage()).toEqual(2);
      });
    });

    describe("page is first page", () => {
      it("returns the first page", () => {
        const subject = buildModel({ page: 1 });

        expect(subject.prevPage()).toEqual(1);
      });
    });
  });

  describe("nextPage()", () => {
    describe("page is not last page", () => {
      it("returns the next page", () => {
        const subject = buildModel({ page: 2 });

        expect(subject.nextPage()).toEqual(3);
      });
    });

    describe("page is last page", () => {
      it("returns the last page", () => {
        const subject = buildModel({ page: 3 });

        expect(subject.nextPage()).toEqual(3);
      });
    });
  });

  describe("hasPrevPage()", () => {
    describe("page is not first page", () => {
      it("returns true", () => {
        const subject = buildModel({ page: 2 });

        expect(subject.hasPrevPage()).toEqual(true);
      });
    });

    describe("page is first page", () => {
      it("returns false", () => {
        const subject = buildModel({ page: 1 });

        expect(subject.hasPrevPage()).toEqual(false);
      });
    });
  });

  describe("hasNextPage()", () => {
    describe("page is not last page", () => {
      it("returns true", () => {
        const subject = buildModel({ page: 2 });

        expect(subject.hasNextPage()).toEqual(true);
      });
    });

    describe("page is last page", () => {
      it("returns false", () => {
        const subject = buildModel({ page: 3 });

        expect(subject.hasNextPage()).toEqual(false);
      });
    });
  });
});
