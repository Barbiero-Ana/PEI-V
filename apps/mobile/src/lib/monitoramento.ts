import type * as SDK from "@sentry/react-native";
import { sanitizarDiagnostico } from "./diagnostico-seguro";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
let Sentry: typeof SDK | undefined;
if (dsn) {
  // O SDK opcional não pode executar módulos nem hooks antes da configuração.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- A avaliação precisa ser condicional e síncrona.
  Sentry = require("@sentry/react-native") as typeof SDK;
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
}

export const monitorarRaiz = Sentry ? Sentry.wrap : <T>(componente: T): T => componente;
export function registrarFalha(erro: Error) {
  if (Sentry && !__DEV__) Sentry.captureException(erro);
}
