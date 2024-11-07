export type QueryError = Error & { code?: string };

export const isQueryError = (error: unknown): error is QueryError => {
  return (
    error instanceof Error && "code" in error && typeof error.code === "string"
  );
};

/**
 * Unique constraint error code
 * @ref: https://github.com/drizzle-team/drizzle-orm/issues/376
 */
export const isUniqueConstraintViolation = (
  error: unknown,
): error is QueryError => {
  return isQueryError(error) && error.code === "23505";
};
