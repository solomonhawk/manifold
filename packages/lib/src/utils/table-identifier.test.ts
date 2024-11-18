import { describe, expect, it } from "vitest";

import {
  buildTableIdentifier,
  parseTableIdentifier,
} from "#utils/table-identifier.js";

describe("buildTableIdentifier", () => {
  it("returns @{username}/{tableSlug}", () => {
    expect(buildTableIdentifier("username", "slug")).toBe("@username/slug");
  });
});

describe("parseTableIdentifier", () => {
  describe("with invalid input", () => {
    it("throws an error", () => {
      expect(() => parseTableIdentifier("invalid")).toThrow(
        "Invalid table identifier",
      );
    });
  });

  describe("with valid input", () => {
    it("parses the username and table slug", () => {
      expect(parseTableIdentifier("@username/slug")).toEqual({
        username: "username",
        tableSlug: "slug",
      });
    });
  });
});
