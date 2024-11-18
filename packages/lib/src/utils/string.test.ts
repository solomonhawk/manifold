import { describe, expect, it } from "vitest";

import { capitalize, pluralize, trimMultiline } from "#utils/string.ts";

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("test")).toBe("Test");
  });
});

describe("pluralize", () => {
  it("adds an 's' if count is 0", () => {
    expect(pluralize("test", 0)).toBe("tests");
  });

  it("does not add an 's' if count is 1", () => {
    expect(pluralize("test", 1)).toBe("test");
  });

  it("adds an 's' if count is > 1", () => {
    expect(pluralize("test", 2)).toBe("tests");
  });
});

describe("trimMultiline", () => {
  it("trims leading and traling whitespace on every line", () => {
    expect(
      trimMultiline(`
      test
      test
    `),
    ).toBe("test\ntest");
  });
});
