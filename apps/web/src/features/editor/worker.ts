/// <reference lib="webworker" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const self: DedicatedWorkerGlobalScope;

import init, { Tabol, table_hash } from "@repo/tabol-core";
import { LRUCache } from "lru-cache";

const initPromise = init({});

const textToHash = new LRUCache<string, string>({ max: 500 });
const hashToTabol = new LRUCache<string, Tabol>({ max: 30 });

function afterInit<U extends unknown[], R>(f: (...args: U) => R) {
  return (...args: U) => {
    return initPromise.then(() => f(...args));
  };
}

/**
 * Parses text with table definitions and instantiates a Tabol. Caches the result.
 */
export const parse = afterInit((text: string) => {
  // compute hash based on table definition text, cache for later
  let hash: string;
  if (textToHash.has(text)) {
    hash = textToHash.get(text)!;
  } else {
    hash = table_hash(text);
    textToHash.set(text, hash);
  }

  // return cached instance, if present
  if (hashToTabol.has(hash)) {
    console.log(hashToTabol.get(hash)!.table_metadata());
    return hash;
  }

  // otherwise, create a new instance and cache it
  const tabol = new Tabol(text);
  hashToTabol.set(hash, tabol);

  return hash;
});

/**
 * Look up table metadata by hash. Assumes the table was previously parsed and cached.
 */
export const tableMetadata = afterInit((hash: string) => {
  if (!hashToTabol.has(hash)) {
    throw new Error(`No data for ${hash}`);
  }

  const tabol = hashToTabol.get(hash)!;

  return tabol.table_metadata();
});

/**
 * Generate variations for a table. Will re-parse table definitions if necessary
 * which is mainly here to work around the fact that the Worker memory is lost
 * during HMR updates.
 *
 * ref: https://github.com/vitejs/vite/discussions/7314
 */
export const gen = afterInit((hash: string, text: string, tableId: string) => {
  if (!hashToTabol.has(hash)) {
    // webworker doesn't support HMR, so we fallback to passing the text and re-parsing it if necessary
    parse(text);
  }

  const tabol = hashToTabol.get(hash)!;

  return tabol.gen(tableId);
});
