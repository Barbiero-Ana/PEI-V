import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  return {
    ...config,
    name: config.name ?? "Modolume",
    slug: config.slug ?? "modolume",
    plugins: [
      ...(config.plugins ?? []),
      ...(dsn
        ? [
            [
              "@sentry/react-native/expo",
              {
                organization: process.env.SENTRY_ORG,
                project: process.env.SENTRY_PROJECT,
                url: "https://sentry.io/",
              },
            ] as [string, Record<string, string | undefined>],
          ]
        : []),
    ],
  };
};
