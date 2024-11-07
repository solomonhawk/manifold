import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export function validationError({
  path,
  message,
}: {
  path: string[];
  message: string;
}) {
  return new TRPCError({
    code: "BAD_REQUEST",
    message,
    cause: new ZodError([
      {
        message,
        path,
        code: "custom",
      },
    ]),
  });
}
