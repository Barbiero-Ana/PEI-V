import * as Sentry from "@sentry/react-native";
import { sanitizarDiagnostico } from "./diagnostico-seguro";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
if (dsn)
  Sentry.init({
    dsn,
    enabled: !__DEV__,
    environment: process.env.EXPO_PUBLIC_APP_ENV ?? "homologacao",
    sendDefaultPii: false,
    maxBreadcrumbs: 0,
    enableAutoSessionTracking: false,
    enableLogs: false,
    tracesSampleRate: 0,
    profilesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    attachScreenshot: false,
    attachViewHierarchy: false,
    beforeSend: sanitizarDiagnostico,
  });

export const monitorarRaiz = dsn ? Sentry.wrap : <T>(componente: T): T => componente;
export function registrarFalha(erro: Error) {
  if (dsn && !__DEV__) Sentry.captureException(erro);
}
