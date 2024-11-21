import sharedConfig from "@manifold/tailwind-config";
import type { Config } from "tailwindcss";

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: ["../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [sharedConfig],
};

export default config;
