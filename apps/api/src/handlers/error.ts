import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import type { Env, ErrorResponse } from "#types.ts";

export function errorHandler(): ErrorHandler<Env> {
  return async (err, c) => {
    console.error(`[ERROR]: ${err}`);

    if (err instanceof HTTPException) {
      return c.json<ErrorResponse>(
        { success: false, message: err.message ?? "An unknown error occurred" },
        err.status,
      );
    }

    return c.json<ErrorResponse>(
      { success: false, message: "Internal server error" },
      500,
    );
  };
}
