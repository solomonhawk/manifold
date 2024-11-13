import { describe, expect, it } from "vitest";

import { PaginationParamsModel } from "./params";

describe("PaginationParamsModel", () => {
  it("returns database query params when `toQuery()` is called", () => {
    const subject = new PaginationParamsModel(2, 100);

    expect(subject.toQuery()).toStrictEqual({
      skip: 100,
      take: 100,
    });
  });

  it("returns pagination metadata when `toMetadata()` is called", () => {
    const subject = new PaginationParamsModel(2, 100);

    expect(subject.toMetadata({ count: 1234 })).toStrictEqual({
      page: 2,
      perPage: 100,
      totalItems: 1234,
      totalPages: 13,
    });
  });
});
