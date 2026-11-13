import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { dirname, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const porta = process.env.PORTA_TESTE_WEB ?? "3487";
const origem = `http://127.0.0.1:${porta}`;
const servidor = spawn(
  process.execPath,
  [resolve(raiz, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", porta],
  {
    cwd: resolve(raiz, "apps/web"),
    windowsHide: true,
    stdio: "inherit",
  },
);
try {
  let entrada;
  for (let tentativa = 0; tentativa < 25; tentativa++) {
    if (servidor.exitCode !== null) throw new Error("O servidor web encerrou durante a inicialização.");
    entrada = await fetch(`${origem}/entrar`, { signal: AbortSignal.timeout(500) }).catch(() => undefined);
    if (entrada) break;
    await setTimeout(300);
  }
  assert.equal(entrada?.status, 200);
  assert.match(await entrada.text(), /Boas-vindas/);
  assert.equal((await fetch(`${origem}/redefinir-senha`)).status, 200);
  assert.equal((await fetch(`${origem}/endereco-inexistente-auditoria`)).status, 404);
  for (const caminho of ["/admin/usuarios", "/coordenacao", "/professor", "/conta/senha", "/professor/atividades/exemplo/alunos/aluno-exemplo"]) {
    const resposta = await fetch(`${origem}${caminho}`, { redirect: "manual" });
    assert.equal(resposta.status, 307, caminho);
    assert.equal(new URL(resposta.headers.get("location"), origem).pathname, "/entrar", caminho);
  }
  console.log("OK: login, recuperação, 404 e redirecionamento das áreas protegidas na build de produção");
} finally {
  if (servidor.exitCode === null) {
    const terminou = once(servidor, "exit");
    servidor.kill();
    await terminou;
  }
}
