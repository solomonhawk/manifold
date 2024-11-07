import { TRPCClientError } from "@trpc/client";

export class RoutingError extends Error {}

export const isNotFoundError = (error: unknown): error is Error => {
  return error instanceof TRPCClientError && error.data?.code === "NOT_FOUND";
};
