import { describe, expect, it } from "vitest";

import { paginationSchema } from "./zod";

describe("paginationSchema", () => {
  it("does not coerce empty strings and nulls to 0s", () => {
    expect(() => paginationSchema.parse({ page: "", perPage: null })).toThrow();
  });

  it("throws if numbers are negative", () => {
    expect(() =>
      paginationSchema.parse({ page: "-2", perPage: -10 }),
    ).toThrow();
  });

  it("coerces valid strings", () => {
    expect(paginationSchema.parse({ page: "5", perPage: "20" })).toMatchObject({
      page: 5,
      perPage: 20,
    });
  });

  it("validates positive numbers", () => {
    expect(paginationSchema.parse({ page: 5, perPage: 20 })).toMatchObject({
      page: 5,
      perPage: 20,
    });
  });
});
