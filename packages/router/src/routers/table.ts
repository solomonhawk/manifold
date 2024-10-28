import { and, asc, db, desc, eq, isNull, schema } from "@manifold/db";
import {
  tableCreateInput,
  tableDeleteInput,
  tableGetInput,
  tableListInput,
  tableUpdateInput,
} from "@manifold/validators";
import { TRPCError } from "@trpc/server";

import { authedProcedure, t } from "#trpc.ts";

export const tableRouter = t.router({
  list: authedProcedure.input(tableListInput).query(({ input, ctx }) => {
    const orderBy = (() => {
      switch (input?.orderBy) {
        case "recently_edited":
          return desc(schema.table.updatedAt);
        case "recently_not_edited":
          return asc(schema.table.updatedAt);
        case "oldest":
          return asc(schema.table.createdAt);
        case "newest":
        default:
          return desc(schema.table.createdAt);
      }
    })();

    return db.query.table
      .findMany({
        where: and(
          eq(schema.table.userId, ctx.user.id),
          isNull(schema.table.deletedAt),
        ),
        orderBy,
      })
      .execute();
  }),

  create: authedProcedure
    .input(tableCreateInput)
    .mutation(async ({ input, ctx }) => {
      const [table] = await db
        .insert(schema.table)
        .values({ ...input, userId: ctx.user.id })
        .returning()
        .execute();

      return table;
    }),

  get: authedProcedure.input(tableGetInput).query(async ({ input, ctx }) => {
    const table = await db.query.table
      .findFirst({
        where: and(
          eq(schema.table.userId, ctx.user.id),
          eq(schema.table.id, input),
          isNull(schema.table.deletedAt),
        ),
      })
      .execute();

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
      // @TODO: differentiate between not found and not allowed?
      const [table] = await db
        .update(schema.table)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(
            eq(schema.table.userId, ctx.user.id),
            eq(schema.table.id, input.id),
          ),
        )
        .returning()
        .execute();

      return table;
    }),

  delete: authedProcedure
    .input(tableDeleteInput)
    .mutation(async ({ input, ctx }) => {
      await db
        .update(schema.table)
        .set({ deletedAt: new Date() })
        .where(
          and(eq(schema.table.userId, ctx.user.id), eq(schema.table.id, input)),
        )
        .execute();
    }),

  favorites: authedProcedure.query(({ ctx }) => {
    return db.query.table
      .findMany({
        where: and(
          eq(schema.table.userId, ctx.user.id),
          eq(schema.table.favorited, true),
          isNull(schema.table.deletedAt),
        ),
      })
      .execute();
  }),
});
