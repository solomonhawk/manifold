/// <reference lib="webworker" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const self: DedicatedWorkerGlobalScope;

import init, * as wasm from "@repo/tabol-core";

await init();

export const parse = (text: string) => {
  wasm.parse(text);
};
