import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "#env.ts";
import * as schema from "#schema/index.ts";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle({
  client: pool,
  casing: "snake_case",
  schema,
  // @TODO: make this configurable
  logger: true,
});
