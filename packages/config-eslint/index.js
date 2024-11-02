/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:tailwindcss/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "simple-import-sort", "import", "check-file"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  settings: {
    tailwindcss: {
      callees: ["class", "cn", "cva"],
      config: "./tailwind.config.ts",
      whitelist: [
        "bg-architect",
        "fade-list-mask",
        "fade-list-mask-visible",
        "toaster",
      ],
    },
  },
  rules: {
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "check-file/filename-naming-convention": [
      "error",
      {
        "**/*.{ts,tsx}": "KEBAB_CASE",
      },
      {
        ignoreMiddleExtensions: true,
      },
    ],
    "check-file/folder-naming-convention": [
      "error",
      {
        "src/**/!(__tests__)": "KEBAB_CASE",
      },
    ],
  },
};
