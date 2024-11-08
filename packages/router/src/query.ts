import { db, eq, schema } from "@manifold/db";

/**
 * It's weird to export this from the router, but right now nothing knows about
 * `db` except `router`. Maybe this should be moved to a different package?
 */
export async function getTable(id: string) {
  return db.query.tables.findFirst({ where: eq(schema.tables.id, id) });
}
