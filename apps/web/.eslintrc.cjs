/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@manifold/eslint-config/react.js"],
  settings: {
    tailwindcss: {
      cssFiles: ["../../packages/ui/src/globals.css"],
      config: "./tailwind.config.ts",
    },
  },
};
