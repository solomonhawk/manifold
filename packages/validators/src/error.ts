import { ZodError } from "zod";

export function isValidationError(e: unknown): e is ZodError {
  return e instanceof ZodError;
}
