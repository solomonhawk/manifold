import { and, asc, db, desc, eq, inArray, isNull, schema } from "@manifold/db";
import { slugify } from "@manifold/lib/utils/string";
import {
  tableCreateInput,
  tableDeleteInput,
  tableGetInput,
  tableListInput,
  tableUpdateInput,
  ZodError,
} from "@manifold/validators";
import { TRPCError } from "@trpc/server";

import { isQueryError } from "#error.js";
import { authedProcedure, t } from "#trpc.ts";

// @XXX: Is this really better than an IIFE with a `switch` statement? 🤔
const tableOrderByMap = {
  recently_edited: desc(schema.table.updatedAt),
  recently_not_edited: asc(schema.table.updatedAt),
  oldest: asc(schema.table.createdAt),
  newest: desc(schema.table.createdAt),
} as const;

export const tableRouter = t.router({
  list: authedProcedure.input(tableListInput).query(({ input, ctx }) => {
    return db.query.table
      .findMany({
        where: and(
          eq(schema.table.userId, ctx.user.id),
          input.includeDeleted ? undefined : isNull(schema.table.deletedAt),
        ),
        orderBy: tableOrderByMap[input.orderBy ?? "newest"],
      })
      .execute();
  }),

  create: authedProcedure
    .input(tableCreateInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const [table] = await db
          .insert(schema.table)
          .values({
            ...input,
            userId: ctx.user.id,
            slug: input.slug ?? slugify(input.title),
          })
          .returning()
          .execute();

        return table;
      } catch (e) {
        if (isQueryError(e)) {
          /**
           * Unique constraint error code
           * @ref: https://github.com/drizzle-team/drizzle-orm/issues/376
           */
          if (e.code === "23505") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Table with this slug already exists",
              cause: new ZodError([
                {
                  message: "Table with this slug already exists",
                  path: ["slug"],
                  code: "custom",
                },
              ]),
            });
          }
        }

        throw e;
      }
    }),

  get: authedProcedure.input(tableGetInput).query(async ({ input, ctx }) => {
    const table = await db.query.table
      .findFirst({
        where: and(
          eq(schema.table.userId, ctx.user.id),
          eq(schema.table.id, input),
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
      const [table] = await db
        .update(schema.table)
        .set(input)
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

  restore: authedProcedure
    .input(tableDeleteInput)
    .mutation(async ({ input, ctx }) => {
      // restore dependencies (edges)
      await db
        .update(schema.table)
        .set({ deletedAt: null })
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
        orderBy: desc(schema.table.updatedAt),
      })
      .execute();
  }),
});
