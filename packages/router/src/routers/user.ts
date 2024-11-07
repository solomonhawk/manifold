import { db, eq, schema } from "@manifold/db";
import { userProfileCreateInput } from "@manifold/validators";

import { authedProcedure, t } from "#trpc.ts";

export const userRouter = t.router({
  profile: authedProcedure.query(async ({ ctx }) => {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.userId, ctx.user.id),
    });

    return profile || null;
  }),

  createProfile: authedProcedure
    .input(userProfileCreateInput)
    .mutation(async ({ input, ctx }) => {
      const [table] = await db
        .insert(schema.userProfiles)
        .values({ ...input, userId: ctx.user.id })
        .returning()
        .execute();

      return table;
    }),
});
