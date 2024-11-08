import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { merge } from "ts-deepmerge";
import { ZodError } from "zod";

import type { Context } from "#types.ts";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
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
      session: ctx.session,
    },
  });
});

export const onboardedProcedure = authedProcedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!ctx.session.userProfile) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({
    ctx: {
      user: ctx.user,
      username: ctx.session.userProfile.username,
    },
  });
});
