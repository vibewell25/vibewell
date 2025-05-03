import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "mobile/**",
      "temp_backup/**",
      "implementation-files/**",
      "scripts/**",
      "docs/**",
      "server/**",
      "cypress/**",
      "tests/**",
      "test-utils/**"
    ],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  // Next.js core and TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Legacy ESLint recommended and TypeScript/react-hooks plugin rules
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ),
  // Custom rule overrides merged from .eslintrc.json
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error"
    }
  }
];

export default eslintConfig;
