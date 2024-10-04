import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";

export default defineConfig({
  plugins: [
    comlink(),
    react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
  ],
  worker: {
    plugins: () => [comlink()],
  },
  build: {
    target: "esnext",
  },
});
