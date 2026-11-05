import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Controller, Get, Module, Post, UseGuards, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { AcessoController } from "./acesso.js";
import {
  Banco,
  EquipeAtual,
  GuardaAdmin,
  GuardaAluno,
  GuardaCoordenacao,
  GuardaEquipe,
  GuardaProfessor,
  type Equipe,
  type PapelEquipe,
} from "./infra.js";

// Nenhum PrismaClient é instanciado: todas as operações do banco usam este fake.
const papeis: PapelEquipe[] = ["professor", "coordenacao", "admin"];
const senhaInicial = "Inicial123-teste";
const hashInicial = bcrypt.hashSync(senhaInicial, 4);
const escola = { id: "escola-teste", nome: "Escola de teste" };
let pessoa = novaPessoa();
let escritas = 0;
let operacoes = 0;
let consultasEquipe = 0;
let alunoAtivo = true;
let versaoAluno = 1;

function novaPessoa(papel: PapelEquipe = "admin") {
  return {
    id: "pessoa-teste",
    nome: "Pessoa de teste",
    email: "pessoa@teste.example",
    papel,
    ativo: true,
    instituicaoId: escola.id,
    instituicao: escola,
    disciplina: null,
    senhaProvisoria: true,
    senhaHash: hashInicial,
  };
}

const banco = {
  professor: {
    findUnique: async () => {
      consultasEquipe++;
      return { ...pessoa };
    },
    findUniqueOrThrow: async () => ({ ...pessoa }),
    update: async ({ data }: { data: Partial<typeof pessoa> }) => {
      escritas++;
      Object.assign(pessoa, data);
      return { ...pessoa };
    },
  },
  aluno: { findUnique: async () => ({ ativo: alunoAtivo, versaoAcesso: versaoAluno }) },
  registro: {
    create: async () => {
      escritas++;
      return {};
    },
  },
};

@Controller("teste")
class OperacoesController {
  @Post("admin")
  @UseGuards(GuardaAdmin)
  admin() {
    operacoes++;
    return { ok: true };
  }

  @Post("professor")
  @UseGuards(GuardaProfessor)
  professor() {
    operacoes++;
    return { ok: true };
  }

  @Post("coordenacao")
  @UseGuards(GuardaCoordenacao)
  coordenacao() {
    operacoes++;
    return { ok: true };
  }

  @Get("equipe")
  @UseGuards(GuardaEquipe)
  equipe(@EquipeAtual() eu: Equipe) {
    return eu;
  }

  @Get("aluno")
  @UseGuards(GuardaAluno)
  aluno() {
    return { ok: true };
  }
}

@Module({
  imports: [JwtModule.register({ global: true, secret: "segredo-exclusivo-dos-testes-sem-ambiente" })],
  controllers: [AcessoController, OperacoesController],
  providers: [{ provide: Banco, useValue: banco }],
})
class ModuloTeste {}

describe("Autorização com senha provisória (HTTP, sem banco persistente)", () => {
  let app: INestApplication;
  let url: string;
  let jwt: JwtService;

  before(async () => {
    app = await NestFactory.create(ModuloTeste, { logger: false });
    await app.listen(0, "127.0.0.1");
    url = await app.getUrl();
    jwt = app.get(JwtService);
  });
  after(async () => {
    await app?.close();
  });
  beforeEach(() => {
    pessoa = novaPessoa();
    escritas = 0;
    operacoes = 0;
    consultasEquipe = 0;
    alunoAtivo = true;
    versaoAluno = 1;
  });

  function token(papel: PapelEquipe | "aluno" = pessoa.papel) {
    return jwt.sign({ sub: pessoa.id, papel, ...(papel === "aluno" ? { v: 1, turmaId: "turma-teste" } : {}) });
  }
  async function chamar(caminho: string, bearer: string | null, corpo?: unknown) {
    return fetch(`${url}${caminho}`, {
      method: corpo === undefined ? "GET" : "POST",
      headers: {
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(corpo === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  }

  for (const papel of papeis) {
    it(`${papel}: bloqueia escrita e consulta sem executar operações`, async () => {
      pessoa = novaPessoa(papel);
      const bearer = token();
      const resposta = await chamar(`/teste/${papel}`, bearer, {});
      assert.equal(resposta.status, 403);
      assert.equal(
        ((await resposta.json()) as { message: string }).message,
        "Troque sua senha provisória para continuar.",
      );
      assert.equal((await chamar("/teste/equipe", bearer)).status, 403);
      assert.equal(operacoes, 0);
      assert.equal(escritas, 0);
      assert.equal(pessoa.senhaProvisoria, true);
    });

    it(`${papel}: permite consultar a própria conta e trocar a senha com o mesmo token`, async () => {
      pessoa = novaPessoa(papel);
      const bearer = token();
      const eu = await chamar("/auth/eu", bearer);
      assert.equal(eu.status, 200);
      assert.equal(((await eu.json()) as { senhaProvisoria: boolean }).senhaProvisoria, true);
      const troca = await chamar("/auth/senha", bearer, { atual: senhaInicial, nova: "Definitiva456-teste" });
      assert.equal(troca.status, 201);
      assert.equal(pessoa.senhaProvisoria, false);
      assert.ok(await bcrypt.compare("Definitiva456-teste", pessoa.senhaHash));
      assert.equal((await chamar(`/teste/${papel}`, bearer, {})).status, 201);
      assert.equal(operacoes, 1);
      const equipe = await chamar("/teste/equipe", bearer);
      assert.equal(equipe.status, 200);
      assert.equal(((await equipe.json()) as Equipe).instituicaoId, escola.id);
    });
  }

  for (const [cenario, atual, nova] of [
    ["senha atual incorreta", "Incorreta123", "Definitiva456"],
    ["nova senha inválida", senhaInicial, "curta"],
    ["nova senha igual à atual", senhaInicial, senhaInicial],
  ]) {
    it(`troca rejeitada por ${cenario} não altera a conta nem libera acesso`, async () => {
      const bearer = token();
      const anterior = { ...pessoa };
      assert.equal((await chamar("/auth/senha", bearer, { atual, nova })).status, 400);
      assert.deepEqual(pessoa, anterior);
      assert.equal(escritas, 0);
      assert.equal((await chamar("/teste/admin", bearer, {})).status, 403);
      assert.equal(operacoes, 0);
    });
  }

  it("consulta novamente o estado do banco após redefinição da senha", async () => {
    pessoa.senhaProvisoria = false;
    const bearer = token();
    assert.equal((await chamar("/teste/admin", bearer, {})).status, 201);
    pessoa.senhaProvisoria = true;
    assert.equal((await chamar("/teste/admin", bearer, {})).status, 403);
    assert.equal(consultasEquipe, 2);
    assert.equal(operacoes, 1);
    assert.equal(escritas, 0);
  });

  it("preserva a restrição por papel mesmo com senha definitiva", async () => {
    pessoa = novaPessoa("professor");
    pessoa.senhaProvisoria = false;
    assert.equal((await chamar("/teste/admin", token(), {})).status, 403);
    assert.equal(operacoes, 0);
    assert.equal(escritas, 0);
  });

  it("exceção de senha não permite conta inativa ou papel alterado", async () => {
    const bearer = token();
    pessoa.ativo = false;
    assert.equal((await chamar("/auth/eu", bearer)).status, 401);
    assert.equal((await chamar("/auth/senha", bearer, { atual: senhaInicial, nova: "Outra45678" })).status, 401);
    pessoa.ativo = true;
    pessoa.papel = "professor";
    assert.equal((await chamar("/auth/eu", bearer)).status, 401);
    assert.equal(escritas, 0);
  });

  it("exige JWT válido mesmo nas exceções", async () => {
    assert.equal((await chamar("/auth/eu", null)).status, 401);
    assert.equal((await chamar("/auth/eu", "token-invalido")).status, 401);
    const expirado = jwt.sign({ sub: pessoa.id, papel: pessoa.papel }, { expiresIn: -1 });
    assert.equal((await chamar("/auth/eu", expirado)).status, 401);
    assert.equal(consultasEquipe, 0);
    assert.equal(escritas, 0);
  });

  it("preserva autenticação, ativação e versão de acesso dos alunos", async () => {
    const bearer = token("aluno");
    assert.equal((await chamar("/teste/aluno", bearer)).status, 200);
    alunoAtivo = false;
    assert.equal((await chamar("/teste/aluno", bearer)).status, 401);
    alunoAtivo = true;
    versaoAluno = 2;
    assert.equal((await chamar("/teste/aluno", bearer)).status, 401);
    assert.equal(consultasEquipe, 0);
    assert.equal(escritas, 0);
  });
});
