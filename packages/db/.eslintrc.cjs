/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@manifold/eslint-config/index.js", "plugin:drizzle/all"],
  plugins: ["drizzle"],
};
