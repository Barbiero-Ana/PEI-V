const path = require("node:path");
const react = path.dirname(require.resolve("react/package.json", { paths: [__dirname] }));

module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/ui/**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/ui/preparar.cjs"],
  moduleNameMapper: {
    "^react$": react,
    "^react/(.*)$": `${react}/$1`,
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@modolume/core$": "<rootDir>/../../packages/core/src/index.ts",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?/|expo(nent)?|@expo(nent)?/|@expo-google-fonts/|@react-navigation/|react-navigation|@sentry/react-native|react-native-svg|@dicebear/|three/))",
  ],
  watchman: false,
  testTimeout: 15000,
};
