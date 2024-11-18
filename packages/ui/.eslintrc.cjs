/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@manifold/eslint-config/base.js"],
  settings: {
    tailwindcss: {
      cssFiles: ["./src/globals.css"],
      config: "./tailwind.config.ts",
    },
  },
};
