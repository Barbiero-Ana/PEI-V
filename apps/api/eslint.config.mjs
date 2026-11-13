import analisador from "@typescript-eslint/parser";

export default [
  { ignores: ["node_modules/**", "dist/**"] },
  {
    files: ["**/*.ts"],
    languageOptions: { parser: analisador },
    rules: {
      "constructor-super": "error", "no-debugger": "error", "no-dupe-else-if": "error",
      "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }], "no-empty-pattern": "error",
      "no-fallthrough": "error", "no-unsafe-finally": "error", "no-unreachable": "error", "no-useless-catch": "error", "prefer-const": "error",
      "no-restricted-imports": ["error", { patterns: [
        { group: ["react", "react-native", "expo", "expo-*", "next", "next/*"], message: "A API não depende das interfaces web e mobile." },
        { group: ["**/apps/web/**", "**/apps/mobile/**"], message: "Compartilhe contratos pelo pacote @modolume/core." },
      ] }],
    },
  },
];
