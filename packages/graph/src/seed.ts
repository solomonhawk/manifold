import { Database } from "arangojs";

import { env } from "./env";

const systemDb = new Database({
  url: env.GRAPH_DATABASE_URL,
});

async function seed() {
  try {
    await systemDb.dropDatabase(env.GRAPH_DATABASE_NAME);
    console.log(`Dropped database "${env.GRAPH_DATABASE_NAME}"`);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
    }
  }

  try {
    /**
     * Create Manifold database if it doesn't exist
     */
    const db = systemDb.database(env.GRAPH_DATABASE_NAME);

    if (!(await db.exists())) {
      await systemDb.createDatabase(env.GRAPH_DATABASE_NAME);

      console.log(`Created database "${env.GRAPH_DATABASE_NAME}"`);
    }

    /**
     * Create table-packages collection if it doesn't exist
     */
    const tablePackagesCollection = db.collection("table-packages");

    if (!(await tablePackagesCollection.exists())) {
      await db.createCollection("table-packages", {
        schema: {
          rule: {
            type: "object",
            properties: {
              ownerId: { type: "string" },
              ownerUsername: { type: "string" },
              tableId: { type: "string" },
              tableSlug: { type: "string" },
              tableIdentifier: { type: "string" },
              version: { type: "number" },
            },
            required: [
              "ownerId",
              "ownerUsername",
              "tableId",
              "tableSlug",
              "tableIdentifier",
              "version",
            ],
          },
        },
      });

      console.log(`Created collection "table-packages"`);
    }

    /**
     * Create table-registry graph if it doesn't exist
     */
    const tableRegistryGraph = db.graph("table-registry");

    if (!(await tableRegistryGraph.exists())) {
      await tableRegistryGraph.create([
        {
          collection: "table-dependencies",
          from: ["table-packages"],
          to: ["table-packages"],
        },
      ]);
      console.log(`Created graph "table-registry"`);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
    }
  }
}

seed();
