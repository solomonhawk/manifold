/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@manifold/eslint-config/base.js", "plugin:drizzle/all"],
  plugins: ["drizzle"],
};
