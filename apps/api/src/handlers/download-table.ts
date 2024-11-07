import { getTable } from "@manifold/router/query";
import type { Context } from "hono";
import { stream } from "hono/streaming";

export async function downloadTable(c: Context) {
  const id = c.req.param("id");
  const table = await getTable(id);

  if (!table) {
    c.redirect("/not-found");
    return;
  }

  c.header(
    "Content-Disposition",
    `attachment; filename="${table.title} (${id}).tbl"`,
  );

  return stream(c, async (stream) => {
    await stream.write(table.definition);
  });
}
