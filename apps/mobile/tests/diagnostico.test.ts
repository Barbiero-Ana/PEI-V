import assert from "node:assert/strict";
import { test } from "node:test";
import type { ErrorEvent } from "@sentry/react-native";
import { sanitizarDiagnostico } from "../src/lib/diagnostico-seguro";

test("diagnóstico não repassa credenciais, respostas, contas ou valores locais", () => {
  const segredo = "conteudo-pessoal-nao-deve-sair";
  const evento: ErrorEvent = {
    type: undefined,
    message: segredo,
    user: { id: segredo, email: segredo },
    request: { data: segredo, headers: { Authorization: segredo } },
    breadcrumbs: [{ message: segredo }],
    extra: { resposta: segredo },
    contexts: { conta: { nome: segredo } },
    exception: {
      values: [
        {
          type: "TypeError",
          value: segredo,
          stacktrace: {
            frames: [
              {
                filename: `https://api.modolume.com.br/main.bundle?token=${segredo}`,
                lineno: 42,
                colno: 3,
                vars: { pin: segredo },
              },
            ],
          },
        },
      ],
    },
    release: "br.com.modolume.app@1.0.0+3",
  };
  const seguro = sanitizarDiagnostico(evento);
  assert.ok(!JSON.stringify(seguro).includes(segredo));
  assert.equal(seguro.release, evento.release);
  assert.equal(seguro.exception?.values?.[0]?.stacktrace?.frames?.[0]?.lineno, 42);
  assert.equal(seguro.exception?.values?.[0]?.stacktrace?.frames?.[0]?.filename, "main.bundle");
});
