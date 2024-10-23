import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
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
        target: "http://localhost:3000",
      },
    },
  },
});
