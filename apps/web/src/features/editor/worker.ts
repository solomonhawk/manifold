/// <reference lib="webworker" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const self: DedicatedWorkerGlobalScope;

import init, { Tabol, table_hash } from "@repo/tabol-core";

await init({});

const textToHash = new Map<string, string>();
const hashToTabol = new Map<string, Tabol>();

export const parse = (text: string) => {
  let hash: string;
  if (textToHash.has(text)) {
    hash = textToHash.get(text)!;
  } else {
    hash = table_hash(text);
    textToHash.set(text, hash);
  }

  if (hashToTabol.has(hash)) {
    console.log(hashToTabol.get(hash)!.table_ids());
    return hash;
  }

  const tabol = new Tabol(text);
  hashToTabol.set(hash, tabol);
  return hash;
};

export const tableIds = (hash: string) => {
  if (!hashToTabol.has(hash)) {
    throw new Error(`No data for ${hash}`);
  }

  const tabol = hashToTabol.get(hash)!;

  return tabol.table_ids();
};

export const gen = (hash: string, text: string, tableId: string) => {
  if (!hashToTabol.has(hash)) {
    // webworker doesn't support HMR, so we fallback to passing the text and re-parsing it if necessary
    parse(text);
  }

  const tabol = hashToTabol.get(hash)!;

  return tabol.gen(tableId);
};
