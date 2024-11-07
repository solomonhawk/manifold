import { isUniqueConstraintViolation, tableService } from "@manifold/db";
import {
  tableCreateInput,
  tableDeleteInput,
  tableGetInput,
  tableListInput,
  tableRestoreInput,
  tableUpdateInput,
} from "@manifold/validators";
import { TRPCError } from "@trpc/server";

import { validationError } from "#error.ts";
import { authedProcedure, t } from "#trpc.ts";

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
