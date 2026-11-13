const configurado = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
module.exports = configurado
  ? require("@sentry/react-native/metro").getSentryExpoConfig(__dirname, {
      enableSourceContextInDevelopment: false,
      autoWrapExpoRouterErrorBoundary: false,
    })
  : require("expo/metro-config").getDefaultConfig(__dirname);
