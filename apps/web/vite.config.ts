import "dotenv/config";

import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { tsImport } from "tsx/esm/api";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import tsconfigPaths from "vite-tsconfig-paths";

import type { Env } from "./src/env";

/**
 * Cannot import TS ESM modules directly in Vite config, so we rely on `tsx`'s
 * `tsImport` helper to load the `env` module, which we then have to cast to the
 * correct type manually, :sadge:
 */
const { env } = (await tsImport("./src/env.ts", {
  parentURL: import.meta.url,
})) as { env: Env };

export default defineConfig({
  envPrefix: "PUBLIC_",
  plugins: [
    comlink(),
    react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
    tsconfigPaths(),
  ],
  worker: {
    plugins: () => [comlink()],
  },
  server: {
    proxy: {
      "/api": {
        target: env.API_PROXY_URL,
        changeOrigin: true,
      },
    },
  },
});
