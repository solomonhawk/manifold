/// <reference lib="webworker" />

import init, { table_hash, TableCollection } from "@manifold/engine";
import type { TableMetadata } from "@manifold/lib/models/roll";
import { LRUCache } from "lru-cache";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const self: DedicatedWorkerGlobalScope;

const initPromise = init({});

const textToHash = new LRUCache<string, string>({ max: 500 });
const hashToTableCollection = new LRUCache<string, TableCollection>({
  max: 100,
});

function afterInit<U extends unknown[], R>(f: (...args: U) => R) {
  return (...args: U) => {
    return initPromise.then(() => f(...args));
  };
}

/**
 * Parses text with table definitions and instantiates a TableCollection. Caches the result.
 */
export const parse = afterInit((text: string) => {
  // compute hash based on table definition text, cache for later
  let hash: string;
  if (textToHash.has(text)) {
    hash = textToHash.get(text)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  } else {
    hash = table_hash(text);
    textToHash.set(text, hash);
  }

  // return cached instance, if present
  if (hashToTableCollection.has(hash)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tableCollection = hashToTableCollection.get(hash)!;

    return {
      hash,
      metadata: tableCollection.table_metadata() as TableMetadata[],
      dependencies: tableCollection.dependencies() as string[],
      missingDependencies: tableCollection.validate_tables() as string[],
    };
  }

  // otherwise, create a new instance and cache it
  const tableCollection = new TableCollection(text);

  hashToTableCollection.set(hash, tableCollection);

  return {
    hash,
    metadata: tableCollection.table_metadata() as TableMetadata[],
    dependencies: tableCollection.dependencies() as string[],
    missingDependencies: tableCollection.validate_tables() as string[],
  };
});

/**
 * Generate variations for a table. Will re-parse table definitions if necessary
 * which is mainly here to work around the fact that the Worker memory is lost
 * during HMR updates.
 *
 * ref: https://github.com/vitejs/vite/discussions/7314
 */
export const gen = afterInit((hash: string, text: string, tableId: string) => {
  if (!hashToTableCollection.has(hash)) {
    // webworker doesn't support HMR, so we fallback to passing the text and re-parsing it if necessary
    parse(text);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabol = hashToTableCollection.get(hash)!;

  return tabol.gen(tableId, false);
});
