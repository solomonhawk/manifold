import { tableVersionService } from "@manifold/db";
import {
  tableVersionGetInput,
  tableVersionListInput,
} from "@manifold/validators";
import { TRPCError } from "@trpc/server";

import { t } from "#trpc.ts";

export const tableVersionRouter = t.router({
  get: t.procedure.input(tableVersionGetInput).query(async ({ input }) => {
    const tableVersion = await tableVersionService.findTableVersion(input);

    if (!tableVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Table version not found",
      });
    }

    return tableVersion;
  }),

  list: t.procedure.input(tableVersionListInput).query(async ({ input }) => {
    return await tableVersionService.listTableVersions(input);
  }),
});
