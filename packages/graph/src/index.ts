import { aql } from "arangojs";

import {
  db,
  tableDependenciesCollection,
  tablePackagesCollection,
  tableRegistryGraph,
} from "#db.ts";
import { tablePackagesTableKey } from "#helpers/table-key.ts";

const MAX_DEPENDENCY_DEPTH = 20;

/**
 * v1 only support "latest" version of published tables (the _key is the same from verison to version)
 * 1. client: create new table A
 * 2. server: save "table-packages" vertex for A
 *
 * 1. client: save table A with imports
 * 2. server: create "table-packages" vertex for A
 * 2. server: get table metadata, find imported tables
 * 3. for each imported table I, create or update a dependency edge
 *    { from: A, to: I }
 */
export type CreatePackageParams = {
  ownerId: string;
  ownerUsername: string;
  tableId: string;
  tableSlug: string;
  tableIdentifier: string;
  version: number;
};

export class TableRegistryError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.cause = cause;
  }
}

async function createPackage({
  ownerId,
  ownerUsername,
  tableId,
  tableSlug,
  tableIdentifier,
  version,
}: CreatePackageParams) {
  try {
    return await tablePackagesCollection.save(
      {
        _key: tablePackagesTableKey(tableIdentifier, version),
        ownerId,
        ownerUsername,
        tableId,
        tableSlug,
        tableIdentifier,
        version,
      },
      {
        returnNew: true,
      },
    );
  } catch (error) {
    throw new TableRegistryError(
      "Failed to create package",
      error instanceof Error ? error : undefined,
    );
  }
}

export type GetAllDependenciesParams = {
  tableIdentifier: string;
  version: number;
  maxDepth?: number;
};

export type Dependency = {
  edgeKey: string;
  toKey: string;
  tableIdentifier: string;
  version: number;
};

async function getAllDependencies({
  tableIdentifier,
  version,
  maxDepth = MAX_DEPENDENCY_DEPTH,
}: GetAllDependenciesParams) {
  try {
    const key = `table-packages/${tablePackagesTableKey(tableIdentifier, version)}`;
    const graphName = tableRegistryGraph.name;

    // How many levels of dependencies is too many to search for here?
    const traversal = await db.query<Dependency>(
      aql`
      FOR v, e IN 1..${maxDepth} OUTBOUND ${key} GRAPH ${graphName}
      RETURN { toKey: v._key, edgeKey: e._key, tableIdentifier: v.tableIdentifier, version: v.version }
    `,
      {
        maxRuntime: 10, // seconds
        count: false,
      },
    );

    return await traversal.all();
  } catch (error) {
    throw new TableRegistryError(
      "Failed to get all dependencies",
      error instanceof Error ? error : undefined,
    );
  }
}

export type SyncDependenciesParams = {
  tableIdentifier: string;
  version: number;
  dependencies: {
    dependencyIdentifier: string;
    dependencyVersion: number;
  }[];
};

export async function syncDependencies({
  tableIdentifier,
  version,
  dependencies,
}: SyncDependenciesParams) {
  try {
    const from = `table-packages/${tablePackagesTableKey(tableIdentifier, version)}`;

    await db.withTransaction(tableDependenciesCollection, async (step) => {
      /**
       * Only remove the edges directly connected to the table version. If we
       * don't limit the depth then we will destroy other tables dependencies
       * as well.
       */
      const existingDependencies = await getAllDependencies({
        tableIdentifier,
        version,
        maxDepth: 1,
      });

      // remove old edges
      if (existingDependencies.length > 0) {
        const edgesToRemove = existingDependencies.map(({ edgeKey }) => ({
          _key: edgeKey,
        }));

        await step(() =>
          tableDependenciesCollection.collection.removeAll(edgesToRemove),
        );
      }

      // create new edges
      if (dependencies.length > 0) {
        for (const {
          dependencyIdentifier,
          dependencyVersion,
        } of dependencies) {
          const to = `table-packages/${tablePackagesTableKey(dependencyIdentifier, dependencyVersion)}`;

          await step(() =>
            tableDependenciesCollection.save({ _from: from, _to: to }),
          );
        }
      }
    });
  } catch (error) {
    throw new TableRegistryError(
      "Failed to sync dependencies",
      error instanceof Error ? error : undefined,
    );
  }
}

export type AddDependenciesParams = {
  tableIdentifier: string;
  version: number;
  dependencies: {
    dependencyIdentifier: string;
    dependencyVersion: number;
  }[];
};

async function addDependencies({
  tableIdentifier,
  version,
  dependencies,
}: AddDependenciesParams) {
  const from = `table-packages/${tablePackagesTableKey(tableIdentifier, version)}`;

  try {
    await db.withTransaction(tableDependenciesCollection, async (step) => {
      for (const { dependencyIdentifier, dependencyVersion } of dependencies) {
        await step(async () =>
          tableDependenciesCollection.save({
            _from: from,
            _to: `table-packages/${tablePackagesTableKey(dependencyIdentifier, dependencyVersion)}`,
          }),
        );
      }
    });
  } catch (error) {
    throw new TableRegistryError(
      "Failed to add dependencies",
      error instanceof Error ? error : undefined,
    );
  }
}

export const tableRegistry = {
  createPackage,
  addDependencies,
  syncDependencies,
  getAllDependencies,
};
