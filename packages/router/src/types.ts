import type { DefaultErrorShape, TRPCError } from "@trpc/server";

export type ErrorFormatter<T> = (
  error: TRPCError,
  shape: DefaultErrorShape,
) => T;

export type Context = {
  // @TODO: get this type from somewhere else (AdapterUser)?
  user: { id: string; email: string; emailVerified: boolean } | null;
  session: { userProfile?: { username: string } } | null;
  formatError?: ErrorFormatter<DefaultErrorShape>;
};
