/** @type {import("eslint").Linter.Config} */
module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
