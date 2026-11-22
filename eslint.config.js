import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["src/offline/service-worker.template.js"],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: [
      "scripts/**/*.mjs",
      "e2e/**/*.ts",
      "vite-plugins/**/*.ts",
      "*.config.{js,ts,mjs}",
    ],
    languageOptions: { globals: globals.node },
  },
  eslintConfigPrettier,
  {
    rules: {
      curly: ["error", "all"],
    },
  },
);
