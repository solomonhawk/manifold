import { Database } from "arangojs";

import { env } from "#env.js";

const db = new Database({
  url: env.GRAPH_DATABASE_URL,
  databaseName: env.GRAPH_DATABASE_NAME,
});

const tableRegistryGraph = db.graph("table-registry");

const tablePackagesCollection =
  tableRegistryGraph.vertexCollection("table-packages");

const tableDependenciesCollection =
  tableRegistryGraph.edgeCollection("table-dependencies");

export {
  db,
  tableDependenciesCollection,
  tablePackagesCollection,
  tableRegistryGraph,
};
