import { tableService, tableVersionService } from "@manifold/db";
import { tableRegistry } from "@manifold/graph";
import {
  tableVersionGetInput,
  tableVersionListInput,
} from "@manifold/validators";
import { TRPCError } from "@trpc/server";

import { t } from "#trpc.ts";

const ONE_HOUR_IN_SECONDS = 60 * 60;

export const tableVersionRouter = t.router({
  get: t.procedure.input(tableVersionGetInput).query(async ({ input }) => {
    const tableVersion = await tableVersionService.findTableVersion(input);

    if (!tableVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Table version not found",
      });
    }

    const dependencyIdentifiers = await tableRegistry.getAllDependencies({
      tableIdentifier: tableVersion.tableIdentifier,
      version: 0,
    });

    const dependencies = await tableService.listTableVersions(
      dependencyIdentifiers,
    );

    return {
      ...tableVersion,
      dependencies,
    };
  }),

  list: t.procedure.input(tableVersionListInput).query(async ({ input }) => {
    return await tableVersionService.listTableVersions(input);
  }),

  summary: t.procedure.query(async ({ ctx }) => {
    const summary = await tableVersionService.getSummary();

    ctx.header(
      "Cache-Control",
      `s-maxage=1, stale-while-revalidate=${ONE_HOUR_IN_SECONDS}`,
    );

    return summary;
  }),
});
