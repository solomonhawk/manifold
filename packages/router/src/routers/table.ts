import { isUniqueConstraintViolation, tableService } from "@manifold/db";
import { tableRegistry } from "@manifold/graph";
import { flatten } from "@manifold/lib";
import {
  isValidationError,
  tableCreateInput,
  tableDeleteInput,
  tableGetInput,
  tableListInput,
  tablePublishVersionInput,
  tableResolveDependenciesInput,
  tableRestoreInput,
  tableUpdateInput,
} from "@manifold/validators";
import { TRPCError } from "@trpc/server";

import { validationError } from "#error.ts";
import { authedProcedure, onboardedProcedure, t } from "#trpc.ts";

export const tableRouter = t.router({
  list: authedProcedure.input(tableListInput).query(({ input, ctx }) => {
    return tableService.listTables(ctx.user.id, input);
  }),

  create: onboardedProcedure
    .input(tableCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const table = await tableService.createTable(
          ctx.user.id,
          ctx.username,
          input,
        );

        await tableRegistry.createPackage({
          ownerId: ctx.user.id,
          ownerUsername: ctx.username,
          tableId: table.id,
          tableSlug: table.slug,
          tableIdentifier: table.tableIdentifier,
          version: 0,
        });

        return table;
      } catch (e) {
        // @TODO: clean up partial records in case of error?
        if (isUniqueConstraintViolation(e)) {
          throw validationError({
            path: ["slug"],
            message: "Table with this slug already exists",
          });
        }

        if (isValidationError(e)) {
          throw validationError({
            cause: e,
            message:
              "We couldn’t generate a valid identifier for this table, please specify one explicitly",
          });
        }

        throw e;
      }
    }),

  get: authedProcedure.input(tableGetInput).query(async ({ input, ctx }) => {
    const table = await tableService.findTable(ctx.user.id, input);

    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Table not found",
      });
    }

    const dependencyIdentifiers = await tableRegistry.getAllDependencies({
      tableIdentifier: table.tableIdentifier,
      version: 0,
    });

    const dependencies = await tableService.listTableVersions(
      dependencyIdentifiers,
    );

    return {
      ...table,
      dependencies,
    };
  }),

  resolveDependencies: t.procedure
    .input(tableResolveDependenciesInput)
    .query(async ({ input }) => {
      // @TODO: need to actually resolve this against the graph
      const tableVersions = await tableService.resolveDependencies(input);

      const dependencies = await Promise.all(
        tableVersions.map((tableVersion) => {
          return tableRegistry.getAllDependencies({
            tableIdentifier: tableVersion.tableIdentifier,
            version: tableVersion.version,
          });
        }),
      );

      return await tableService.listTableVersions([
        ...flatten(dependencies),
        ...tableVersions,
      ]);
    }),

  update: authedProcedure
    .input(tableUpdateInput)
    .mutation(async ({ input, ctx }) => {
      // https://github.com/SlavaPanevskiy/node-sagas
      const updatedTable = await tableService.updateTable(ctx.user.id, input);

      if (input.dependencies) {
        // remove old edges and create new edges
        await tableRegistry.syncDependencies({
          tableIdentifier: updatedTable.tableIdentifier,
          version: 0, // we only ever update the edges on the draft table instance
          dependencies: input.dependencies,
        });
      }

      // @TODO: also retrieve dependencies (for optimistic UI update?)
      return updatedTable;
    }),

  publish: onboardedProcedure
    .input(tablePublishVersionInput)
    .mutation(async ({ input, ctx }) => {
      const tableVersion = await tableService.publishVersion(
        ctx.user.id,
        ctx.username,
        input,
      );

      await tableRegistry.createPackage({
        ownerId: ctx.user.id,
        ownerUsername: ctx.username,
        tableId: input.tableId,
        tableSlug: tableVersion.tableSlug,
        tableIdentifier: tableVersion.tableIdentifier,
        version: tableVersion.version,
      });

      await tableRegistry.addDependencies({
        tableIdentifier: tableVersion.tableIdentifier,
        version: tableVersion.version,
        dependencies: input.dependencies,
      });

      return tableVersion;
    }),

  delete: authedProcedure
    .input(tableDeleteInput)
    .mutation(async ({ input, ctx }) => {
      return tableService.deleteTable(ctx.user.id, input);
    }),

  restore: authedProcedure
    .input(tableRestoreInput)
    .mutation(async ({ input, ctx }) => {
      return tableService.restoreTable(ctx.user.id, input);
    }),

  favorites: authedProcedure.query(({ ctx }) => {
    return tableService.listFavorites(ctx.user.id);
  }),
});
