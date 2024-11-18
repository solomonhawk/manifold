import { describe, expect, it } from "vitest";

import { injectNamespacePragmasWorkaround } from "#utils/parser-dependency-injection.ts";
import { trimMultiline } from "#utils/string.ts";

describe("injectNamespacePragmasWorkaround", () => {
  describe("with no dependencies", () => {
    it("returns the original definition", () => {
      expect(injectNamespacePragmasWorkaround("definition", [])).toBe(
        "definition",
      );
    });
  });

  describe("with dependencies", () => {
    it("adds namespace pragmas", () => {
      expect(
        injectNamespacePragmasWorkaround(
          trimMultiline(`
            ---
            id: test
            table: Test
            ---
            1: test
          `),
          [
            {
              tableIdentifier: "@ns1/table-1",
              definition: trimMultiline(`
                ---
                id: test
                table: Test
                ---
                1: test
              `),
            },
          ],
        ),
      ).toBe(
        trimMultiline(`
          ---
          id: test
          table: Test
          ---
          1: test

          @@PRAGMA namespace=@ns1/table-1
          ---
          id: test
          table: Test
          ---
          1: test
        `),
      );
    });
  });
});
