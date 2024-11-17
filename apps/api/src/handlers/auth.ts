import { verifyAuth } from "@manifold/auth";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const verifyAuthMiddleware = verifyAuth();

/**
 * Sets the current user on the context if the user is authenticated. Otherwise,
 * it will continue to the next middleware. Unlike `verifyAuth` which requires
 * an authenticated user and throws a 401 HTTPException otherwise.
 */
export function setAuthUser(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await verifyAuthMiddleware(c, next);
    } catch (e) {
      if (e instanceof HTTPException && e.status === 401) {
        await next();
        return;
      }

      throw e;
    }
  };
}
