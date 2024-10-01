/// <reference lib="webworker" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const self: DedicatedWorkerGlobalScope;

import init, { Tabol, table_hash } from "@repo/tabol-core";

await init();

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
