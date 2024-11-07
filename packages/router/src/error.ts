export type QueryError = Error & { code?: string };

export const isQueryError = (error: unknown): error is QueryError => {
  return (
    error instanceof Error && "code" in error && typeof error.code === "string"
  );
};
