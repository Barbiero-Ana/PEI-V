import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { test } from "node:test";

test("APK e AAB recusam API ausente, local ou insegura e aceitam HTTPS público", () => {
  const script = resolve(import.meta.dirname, "../scripts/verificar-api-loja.mjs");
  for (const perfil of ["preview", "play-internal", "production"]) {
    for (const url of [
      "",
      "auto",
      "http://api.modolume.com.br",
      "https://localhost",
      "https://127.0.0.1",
      "https://api.exemplo.test",
      "https://usuario:senha@api.modolume.com.br",
      "https://api.modolume.com.br?segredo=1",
    ]) {
      const r = spawnSync(process.execPath, [script], {
        env: { ...process.env, EXPO_PUBLIC_SENTRY_DSN: "", EAS_BUILD_PROFILE: perfil, EXPO_PUBLIC_API_URL: url },
        encoding: "utf8",
      });
      assert.equal(r.status, 1, `${perfil}: ${url}`);
    }
    const r = spawnSync(process.execPath, [script], {
      env: {
        ...process.env,
        EXPO_PUBLIC_SENTRY_DSN: "",
        EAS_BUILD_PROFILE: perfil,
        EXPO_PUBLIC_API_URL: "https://api.modolume.com.br",
      },
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
  }
});

test("monitoramento habilitado exige credenciais de mapas de código sem expor seus valores", () => {
  const r = spawnSync(process.execPath, [resolve(import.meta.dirname, "../scripts/verificar-api-loja.mjs")], {
    env: {
      ...process.env,
      EAS_BUILD_PROFILE: "preview",
      EXPO_PUBLIC_API_URL: "https://api.modolume.com.br",
      EXPO_PUBLIC_SENTRY_DSN: "https://chave-publica@o1.ingest.sentry.io/1",
      SENTRY_ORG: "",
      SENTRY_PROJECT: "",
      SENTRY_AUTH_TOKEN: "valor-privado-nao-logar",
    },
    encoding: "utf8",
  });
  assert.equal(r.status, 1);
  assert.ok(r.stderr.includes("SENTRY_ORG"));
  assert.ok(!r.stderr.includes("valor-privado-nao-logar"));
});
