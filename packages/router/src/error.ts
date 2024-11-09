import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

type ErrorPathAndMessage = {
  path: string[];
  message: string;
};

type ErrorCauseAndMessage = {
  cause: ZodError;
  message: string;
};

export function validationError(
  causeAndMessage: ErrorCauseAndMessage,
): TRPCError;
export function validationError(pathAndMessage: ErrorPathAndMessage): TRPCError;
export function validationError(
  pathOrCauseAndMessage: ErrorPathAndMessage | ErrorCauseAndMessage,
): TRPCError {
  if ("cause" in pathOrCauseAndMessage) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: pathOrCauseAndMessage.message,
      cause: pathOrCauseAndMessage.cause,
    });
  }

  return new TRPCError({
    code: "BAD_REQUEST",
    message: pathOrCauseAndMessage.message,
    cause: new ZodError([
      {
        message: pathOrCauseAndMessage.message,
        path: pathOrCauseAndMessage.path,
        code: "custom",
      },
    ]),
  });
}
