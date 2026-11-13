import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { Controller, Get, Module, HttpException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Banco } from "./infra.js";
import { ControladorProntidao, FiltroErroSeguro, rastrearRequisicao } from "./observabilidade.js";

@Controller("teste")
class ControladorTeste {
  @Get("limite")
  limite() {
    throw new HttpException("Muitas tentativas. Aguarde.", 429);
  }
  @Get("falha/:id")
  falha() {
    throw new Error("nao-registrar-senha-nem-aluno");
  }
}
let bancoDisponivel = true;
@Module({
  controllers: [ControladorTeste, ControladorProntidao],
  providers: [
    {
      provide: Banco,
      useValue: {
        $queryRaw: async () => {
          if (!bancoDisponivel) throw new Error("senha-do-banco");
          return [];
        },
      },
    },
  ],
})
class ModuloTeste {}

test("falhas e prontidão têm identificador, estado correto e não expõem dados pessoais", async () => {
  const linhas: string[] = [],
    log = console.log,
    erro = console.error;
  const app = await NestFactory.create(ModuloTeste, { logger: false });
  app.use(rastrearRequisicao);
  app.useGlobalFilters(new FiltroErroSeguro());
  await app.listen(0, "127.0.0.1");
  try {
    console.log = (...dados: unknown[]) => linhas.push(dados.join(" "));
    console.error = (...dados: unknown[]) => linhas.push(dados.join(" "));
    const url = await app.getUrl();
    const r = await fetch(`${url}/teste/falha/aluno-privado?pin=nao-registrar`, {
      headers: { Authorization: "Bearer token-privado" },
    });
    assert.equal(r.status, 500);
    const corpo = (await r.json()) as { requisicaoId: string };
    assert.equal(corpo.requisicaoId, r.headers.get("x-request-id"));
    assert.ok(!JSON.stringify(corpo).includes("nao-registrar"));
    assert.ok(linhas.some((linha) => linha.includes('"rota":"/teste/falha/:id"')));
    assert.ok(!linhas.join(" ").match(/aluno-privado|token-privado|nao-registrar/));
    const limitada = await fetch(`${url}/teste/limite`);
    assert.equal(limitada.status, 429);
    assert.equal(((await limitada.json()) as { message: string }).message, "Muitas tentativas. Aguarde.");
    assert.equal((await fetch(`${url}/prontidao`)).status, 200);
    bancoDisponivel = false;
    assert.equal((await fetch(`${url}/prontidao`)).status, 503);
    assert.ok(!linhas.join(" ").includes("senha-do-banco"));
  } finally {
    console.log = log;
    console.error = erro;
    bancoDisponivel = true;
    await app.close();
  }
});
