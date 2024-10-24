import { initTRPC, TRPCError } from "@trpc/server";
import { merge } from "ts-deepmerge";
import { ZodError } from "zod";

import type { Context } from "#types.ts";

export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return merge(shape, {
      data: {
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    });
  },
});

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
