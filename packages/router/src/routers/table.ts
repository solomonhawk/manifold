import { isUniqueConstraintViolation, tableService } from "@manifold/db";
import {
  isValidationError,
  tableCreateInput,
  tableDeleteInput,
  tableGetInput,
  tableListInput,
  tablePublishVersionInput,
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

  create: authedProcedure
    .input(tableCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await tableService.createTable(ctx.user.id, input);
      } catch (e) {
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

    return table;
  }),

  update: authedProcedure
    .input(tableUpdateInput)
    .mutation(async ({ input, ctx }) => {
      return tableService.updateTable(ctx.user.id, input);
    }),

  publish: onboardedProcedure
    .input(tablePublishVersionInput)
    .mutation(async ({ input, ctx }) => {
      return tableService.publishVersion(ctx.user.id, ctx.username, input);
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
