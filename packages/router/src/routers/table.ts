import { db, schema } from "@manifold/db";
import { tableCreateInput } from "@manifold/validators";

import { authedProcedure, t } from "#trpc.ts";

export const tableRouter = t.router({
  create: authedProcedure.input(tableCreateInput).mutation(({ input, ctx }) => {
    return db
      .insert(schema.table)
      .values({ ...input, userId: ctx.user.id })
      .returning()
      .execute();
  }),
});
