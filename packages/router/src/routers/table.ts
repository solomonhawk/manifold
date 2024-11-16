import {
  db,
  eq,
  isUniqueConstraintViolation,
  schema,
  tableService,
} from "@manifold/db";
import { tableRegistry } from "@manifold/graph";
import { flatten } from "@manifold/lib";
import {
  isValidationError,
  tableCopyInput,
  tableCreateInput,
  tableDeleteInput,
  tableFindDependenciesInput,
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
  /**
   * List tables. Supports ordering and optionally including deleted tables.
   */
  list: authedProcedure.input(tableListInput).query(({ input, ctx }) => {
    return tableService.listTables(ctx.user.id, input);
  }),

  /**
   * Create a new table.
   *
   * This procedure is wrapped in an `onboardedProcedure` because it requires
   * a user to have a username set (which is used as the namespace for the
   * table's public identifier).
   *
   * Creates a new entry in the registry's table packages collection so that
   * new dependency relationships can be connected to it.
   *
   * @throws {TRPCError} with a BAD_REQUEST code if the slug is already taken,
   *                     the error will contain a ZodError with the validation
   *                     error details
   * @throws {TRPCError} with a BAD_REQUEST code if slug can not be
   *                     auto-generated, the error will contain a ZodError with
   *                     the validation error details
   */
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

  copy: onboardedProcedure
    .input(tableCopyInput)
    .mutation(async ({ input, ctx }) => {
      const tableToCopy = await db.query.tables.findFirst({
        where: eq(schema.tables.id, input.tableId),
      });

      if (!tableToCopy) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Table not found",
        });
      }

      try {
        const table = await tableService.createTable(
          ctx.user.id,
          ctx.username,
          {
            title: input.title,
            description: input.description,
            slug: input.slug,
            definition: tableToCopy.definition,
            availableTables: tableToCopy.availableTables,
          },
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

  /**
   * Get a single table by it's `tableIdentifier`.
   *
   * Resolves all the table's dependencies and includes them in the response.
   *
   * @throws {TRPCError} with a NOT_FOUND code if the table cannot be found
   */
  get: t.procedure.input(tableGetInput).query(async ({ input }) => {
    const table = await tableService.findTable(input);

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

  /**
   * Searches for a list of `tableVersion`s that match the given search query.
   */
  findDependencies: t.procedure
    .input(tableFindDependenciesInput)
    .query(async ({ input }) => {
      const tableVersions = await tableService.findDependencies(input);

      // get all dependencies for each `tableVersion`
      // @TODO: better error handling
      return Promise.all(
        tableVersions.map(async (tableVersion) => {
          const dependenciesForThisVersion =
            await tableRegistry.getAllDependencies({
              tableIdentifier: tableVersion.tableIdentifier,
              version: tableVersion.version,
            });

          return {
            ...tableVersion,
            dependencies: await tableService.listTableVersions(
              dependenciesForThisVersion,
            ),
          };
        }),
      );
    }),

  /**
   * Resolves `tableVersion`s for a list of `tableIdentifiers`s.
   *
   * Each `tableVersion` will have it's dependencies resolved and included in
   * the response, which is flat list of `tableVersions` including those
   * corresponding to the `tableIdentifier`s passed in along with their
   * dependencies.
   */
  resolveDependencies: t.procedure
    .input(tableResolveDependenciesInput)
    .query(async ({ input }) => {
      // get the latest version of each `tableVersion` in the input
      const tableVersions = await tableService.resolveDependencies(input);

      // get all dependencies for each `tableVersion` (graph edges)
      const dependencies = await Promise.all(
        tableVersions.map((tableVersion) => {
          return tableRegistry.getAllDependencies({
            tableIdentifier: tableVersion.tableIdentifier,
            version: tableVersion.version,
          });
        }),
      );

      // resolve table identifiers to `tableVersion` records
      return await tableService.listTableVersions([
        ...flatten(dependencies),
        ...tableVersions,
      ]);
    }),

  /**
   * Update a table. The params passed in are all optional except the `id`.
   *
   * If `dependencies` is passed in, the edges in the graph will be updated to
   * reflect the new dependencies and remove any stale references to old
   * dependencies.
   */
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

  /**
   * Publish a new version of a table.
   *
   * This procedure is wrapped in an `onboardedProcedure` because it requires
   * a user to have a username set (which is used as the namespace for the
   * table's public identifier).
   *
   * Creates a new entry for the new version in the registry's table packages
   * collection so that new dependency relationships can be connected to it.
   *
   * Adds all of the dependencies to the table registry.
   */
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

  /**
   * Delete a table, softly.
   */
  delete: authedProcedure
    .input(tableDeleteInput)
    .mutation(async ({ input, ctx }) => {
      return tableService.deleteTable(ctx.user.id, input);
    }),

  /**
   * Restore a table that was previously deleted.
   */
  restore: authedProcedure
    .input(tableRestoreInput)
    .mutation(async ({ input, ctx }) => {
      return tableService.restoreTable(ctx.user.id, input);
    }),

  /**
   * Lists a user's favorited tables.
   */
  favorites: authedProcedure.query(({ ctx }) => {
    return tableService.listFavorites(ctx.user.id);
  }),
});
