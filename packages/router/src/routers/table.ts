import { and, db, desc, eq, schema } from "@manifold/db";
import { tableCreateInput, tableUpdateInput, z } from "@manifold/validators";

import { authedProcedure, t } from "#trpc.ts";

export const tableRouter = t.router({
  list: authedProcedure.query(({ ctx }) => {
    return db.query.table
      .findMany({
        where: eq(schema.table.userId, ctx.user.id),
        orderBy: desc(schema.table.updatedAt),
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

  get: authedProcedure.input(z.string()).query(({ input, ctx }) => {
    return db.query.table
      .findFirst({
        where: and(
          eq(schema.table.userId, ctx.user.id),
          eq(schema.table.id, input),
        ),
      })
      .execute();
  }),
});
