import type { ErrorEvent } from "@sentry/react-native";

/** Lista permitida: nunca repassa contas, mensagens, corpos HTTP, breadcrumbs ou valores locais. */
export function sanitizarDiagnostico(evento: ErrorEvent): ErrorEvent {
  return {
    type: evento.type,
    event_id: evento.event_id,
    timestamp: evento.timestamp,
    platform: evento.platform,
    level: evento.level,
    release: evento.release,
    dist: evento.dist,
    environment: evento.environment,
    debug_meta: evento.debug_meta,
    exception: {
      values: evento.exception?.values?.map((excecao) => ({
        type: excecao.type?.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 80),
        value: "Falha do aplicativo. Mensagem omitida para proteger dados pessoais.",
        mechanism: excecao.mechanism ? { type: excecao.mechanism.type, handled: excecao.mechanism.handled } : undefined,
        stacktrace: {
          frames: excecao.stacktrace?.frames?.map((frame) => ({
            filename: frame.filename?.split(/[?#]/)[0]?.replace(/.*[\\/]([^\\/]+)$/, "$1"),
            function: frame.function?.replace(/[^a-zA-Z0-9_.<>-]/g, "").slice(0, 160),
            module: frame.module?.replace(/[^a-zA-Z0-9_.@/-]/g, "").slice(0, 160),
            lineno: frame.lineno,
            colno: frame.colno,
            in_app: frame.in_app,
          })),
        },
      })),
    },
  };
}
