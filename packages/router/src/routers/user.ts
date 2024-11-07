import { userService } from "@manifold/db";
import { userProfileCreateInput } from "@manifold/validators";

import { authedProcedure, t } from "#trpc.ts";

export const userRouter = t.router({
  profile: authedProcedure.query(async ({ ctx }) => {
    return userService.getProfile(ctx.user.id);
  }),

  createProfile: authedProcedure
    .input(userProfileCreateInput)
    .mutation(async ({ input, ctx }) => {
      return userService.createProfile(ctx.user.id, input);
    }),
});
