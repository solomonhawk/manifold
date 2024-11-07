import { isUniqueConstraintViolation, userService } from "@manifold/db";
import { userProfileCreateInput } from "@manifold/validators";

import { validationError } from "#error.ts";
import { authedProcedure, t } from "#trpc.ts";

export const userRouter = t.router({
  profile: authedProcedure.query(async ({ ctx }) => {
    return userService.getProfile(ctx.user.id);
  }),

  createProfile: authedProcedure
    .input(userProfileCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        return await userService.createProfile(ctx.user.id, input);
      } catch (e) {
        if (isUniqueConstraintViolation(e)) {
          throw validationError({
            path: ["username"],
            message: "That username is unavailable",
          });
        }

        throw e;
      }
    }),
});
