import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  // Build output and generated files: src/index.css is compiled for Storybook.
  globalIgnores(["dist", "storybook-static", "coverage", "src/index.css"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs["recommended-latest"]],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    // Build scripts and tool config run in Node.
    files: ["scripts/**/*.mjs", "*.{js,mjs,ts}", ".storybook/**/*.ts"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  storybook.configs["flat/recommended"],
);
