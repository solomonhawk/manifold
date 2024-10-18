import sharedConfig from "@manifold/tailwind-config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    // @NOTE(shawk): workaround to make ui vite server pick up config changes
    "../../packages/config-tailwind/*.ts",
  ],
  presets: [sharedConfig],
};

export default config;
