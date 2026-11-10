import analisador from "@typescript-eslint/parser";

export default [
  { ignores: [".next*/**", "next-env.d.ts", "dist/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: analisador,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "constructor-super": "error",
      "no-debugger": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
      "no-empty-pattern": "error",
      "no-fallthrough": "error",
      "no-unsafe-finally": "error",
      "no-unreachable": "error",
      "no-useless-catch": "error",
      "prefer-const": "error",
    },
  },
];
