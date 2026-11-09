import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Module, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { ControladorAdministracao } from "./admin.js";
import { ControladorAluno } from "./aluno.js";
import { ControladorAcesso } from "./acesso.js";
import { Banco, type PapelEquipe } from "./infra.js";

// Fixtures e armazenamento exclusivos do processo. Nunca instancia PrismaClient ou lê .env.
const pinTeste = "5827";
const pinHash = bcrypt.hashSync(pinTeste, 4);
const turmas = [
  { id: "origem", nome: "Origem", serie: "6º", ativa: true, instituicaoId: "escola" },
  { id: "destino", nome: "Destino", serie: "6º", ativa: true, instituicaoId: "escola" },
  { id: "outra-escola", nome: "Outra", serie: "6º", ativa: true, instituicaoId: "outra" },
];
function novoAluno() {
  return {
    id: "aluno-teste",
    nome: "Aluno Teste",
    matricula: "001",
    turmaId: "origem",
    ativo: true,
    codigoAcesso: "ABCDEFGH",
    versaoAcesso: 1,
    pinHash,
    pinFalhas: 0,
    bloqueadoAte: null,
    ultimoAcesso: null as Date | null,
    avatar: null,
  };
}
let aluno = novoAluno();
let escritasAluno = 0;
let consultasAtividades: string[] = [];
let duplicada = false;
const historico = Object.freeze([{ id: "jogada-antiga", alunoId: "aluno-teste", atividadeId: "atividade-origem" }]);
const progresso = Object.freeze([{ alunoId: "aluno-teste", missaoId: "missao-antiga", estrelas: 3 }]);
const eventos: unknown[] = [];

function comTurma() {
  return { ...aluno, turma: { ...turmas.find((t) => t.id === aluno.turmaId)! } };
}
const banco = {
  $transaction: async (executar: (transacao: unknown) => Promise<unknown>) => executar(banco),
  professor: {
    findUnique: async ({ where }: { where: { id: PapelEquipe } }) => ({
      id: where.id,
      nome: "Equipe",
      papel: where.id,
      ativo: true,
      instituicaoId: "escola",
      senhaProvisoria: false,
      versaoAcesso: 1,
    }),
  },
  turma: {
    findFirst: async ({ where }: { where: { id: string; instituicaoId: string } }) =>
      turmas.find((t) => t.id === where.id && t.instituicaoId === where.instituicaoId) ?? null,
    update: async ({ where, data }: { where: { id: string }; data: { ativa: boolean } }) => {
      const turma = turmas.find((t) => t.id === where.id)!;
      Object.assign(turma, data);
      return turma;
    },
  },
  aluno: {
    updateMany: async ({
      where,
      data,
    }: {
      where: { turmaId: string };
      data: { versaoAcesso: { increment: number } };
    }) => {
      if (aluno.turmaId !== where.turmaId) return { count: 0 };
      escritasAluno++;
      aluno.versaoAcesso += data.versaoAcesso.increment;
      return { count: 1 };
    },
    findUnique: async ({ where }: { where: { id?: string; codigoAcesso?: string } }) =>
      where.id === aluno.id || where.codigoAcesso === aluno.codigoAcesso ? comTurma() : null,
    findUniqueOrThrow: async () => comTurma(),
    findFirst: async ({ where }: { where: { id?: string; turma?: { instituicaoId: string }; matricula?: string } }) => {
      if (where.id)
        return where.id === aluno.id && comTurma().turma.instituicaoId === where.turma?.instituicaoId
          ? { ...aluno }
          : null;
      return duplicada ? { ...aluno } : null;
    },
    create: async ({ data }: { data: Partial<typeof aluno> }) => {
      escritasAluno++;
      return { ...novoAluno(), ...data };
    },
    update: async ({
      data,
    }: {
      data: Omit<Partial<typeof aluno>, "versaoAcesso"> & { versaoAcesso?: { increment: number } };
    }) => {
      escritasAluno++;
      const { versaoAcesso, ...campos } = data;
      Object.assign(aluno, campos);
      if (versaoAcesso) aluno.versaoAcesso += versaoAcesso.increment;
      return { ...aluno };
    },
  },
  atividadeProfessor: {
    findMany: async ({ where }: { where: { turmas: { some: { turmaId: string } } } }) => {
      consultasAtividades.push(where.turmas.some.turmaId);
      return [];
    },
  },
  jogada: { findMany: async () => [] },
  registro: {
    create: async (evento: unknown) => {
      eventos.push(evento);
      return {};
    },
  },
};

@Module({
  imports: [JwtModule.register({ global: true, secret: "exclusivo-ciclo-aluno-testes" })],
  controllers: [ControladorAdministracao, ControladorAluno, ControladorAcesso],
  providers: [{ provide: Banco, useValue: banco }],
})
class ModuloTeste {}

describe("Ciclo do aluno (HTTP com banco simulado)", () => {
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
    aluno = novoAluno();
    for (const turma of turmas) turma.ativa = true;
    escritasAluno = 0;
    consultasAtividades = [];
    duplicada = false;
    eventos.length = 0;
  });
  const dados = (turmaId = "destino") => ({ nome: "Aluno Editado", matricula: "001", turmaId });
  function tokenAluno(campos = {}) {
    return jwt.sign({ sub: aluno.id, papel: "aluno", turmaId: aluno.turmaId, v: aluno.versaoAcesso, ...campos });
  }
  function tokenEquipe(papel: PapelEquipe = "admin") {
    return jwt.sign({ sub: papel, papel, v: 1 });
  }
  async function chamar(metodo: string, caminho: string, token?: string, corpo?: unknown) {
    return fetch(`${url}${caminho}`, {
      method: metodo,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(corpo === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  }
  async function verificarBloqueio(token: string, status: number) {
    for (const [metodo, caminho] of [
      ["GET", "/aluno/eu"],
      ["PATCH", "/aluno/eu"],
      ["GET", "/aluno/atividades"],
      ["POST", "/aluno/jogadas"],
      ["GET", "/aluno/progresso"],
      ["PUT", "/aluno/progresso"],
    ]) {
      assert.equal((await chamar(metodo!, caminho!, token, metodo === "GET" ? undefined : {})).status, status, caminho);
    }
  }

  it("transferência incrementa versão e bloqueia JWT antigo em todos os endpoints; novo login usa a turma atual", async () => {
    const antigo = tokenAluno();
    const antes = { historico: structuredClone(historico), progresso: structuredClone(progresso) };
    assert.equal((await chamar("GET", "/aluno/eu", antigo)).status, 200);
    assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados())).status, 200);
    assert.equal(aluno.turmaId, "destino");
    assert.equal(aluno.versaoAcesso, 2);
    assert.equal(aluno.codigoAcesso, "ABCDEFGH");
    assert.equal(aluno.pinHash, pinHash);
    await verificarBloqueio(antigo, 401);
    assert.equal(escritasAluno, 1);
    assert.equal(consultasAtividades.length, 0);
    const login = await chamar("POST", "/auth/aluno", undefined, { codigo: aluno.codigoAcesso, pin: pinTeste });
    assert.equal(login.status, 201);
    const resposta = (await login.json()) as { token: string; turma: { id: string } };
    assert.equal(resposta.turma.id, "destino");
    const sessao = jwt.verify<{ turmaId: string; v: number }>(resposta.token);
    assert.equal(sessao.turmaId, "destino");
    assert.equal(sessao.v, 2);
    assert.equal((await chamar("GET", "/aluno/eu", resposta.token)).status, 200);
    assert.equal((await chamar("GET", "/aluno/atividades", resposta.token)).status, 200);
    assert.deepEqual(consultasAtividades, ["destino"]);
    assert.deepEqual({ historico, progresso }, antes);
  });

  it("edição sem transferência mantém versão e sessão", async () => {
    const token = tokenAluno();
    assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados("origem"))).status, 200);
    assert.equal(aluno.versaoAcesso, 1);
    assert.equal((await chamar("GET", "/aluno/eu", token)).status, 200);
  });

  it("voltar para a turma de origem não revalida tokens anteriores", async () => {
    const token = tokenAluno();
    for (const turmaId of ["destino", "origem"]) {
      assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados(turmaId))).status, 200);
    }
    assert.equal(aluno.versaoAcesso, 3);
    await verificarBloqueio(token, 401);
  });

  it("JWT com versão atual e turma divergente também é recusado", async () => {
    await verificarBloqueio(tokenAluno({ turmaId: "destino" }), 401);
    assert.equal(escritasAluno, 0);
  });

  it("encerrar turma pelo administrador bloqueia todas as rotas e os dois passos de login", async () => {
    const token = tokenAluno();
    assert.equal((await chamar("POST", "/admin/turmas/origem/ativa", tokenEquipe(), { ativa: false })).status, 201);
    await verificarBloqueio(token, 401);
    assert.equal((await chamar("POST", "/auth/aluno/codigo", undefined, { codigo: aluno.codigoAcesso })).status, 401);
    assert.equal(
      (await chamar("POST", "/auth/aluno", undefined, { codigo: aluno.codigoAcesso, pin: pinTeste })).status,
      401,
    );
    assert.equal(escritasAluno, 1);
    assert.equal(consultasAtividades.length, 0);
  });

  it("reabrir exige novo login e não restaura JWT anterior ao encerramento", async () => {
    const antigo = tokenAluno();
    for (const ativa of [false, true]) {
      assert.equal((await chamar("POST", "/admin/turmas/origem/ativa", tokenEquipe(), { ativa })).status, 201);
    }
    assert.equal(aluno.versaoAcesso, 2);
    await verificarBloqueio(antigo, 401);
    const login = await chamar("POST", "/auth/aluno", undefined, { codigo: aluno.codigoAcesso, pin: pinTeste });
    assert.equal(login.status, 201);
    const { token } = (await login.json()) as { token: string };
    assert.equal((await chamar("GET", "/aluno/eu", token)).status, 200);
  });

  it("turma encerrada bloqueia mesmo JWT com versão atual", async () => {
    turmas[0]!.ativa = false;
    await verificarBloqueio(tokenAluno(), 403);
    assert.equal(escritasAluno, 0);
  });

  it("encerramento de outra turma não invalida a sessão do aluno", async () => {
    const token = tokenAluno();
    assert.equal((await chamar("POST", "/admin/turmas/destino/ativa", tokenEquipe(), { ativa: false })).status, 201);
    assert.equal(aluno.versaoAcesso, 1);
    assert.equal((await chamar("GET", "/aluno/eu", token)).status, 200);
  });

  for (const operacao of ["cadastro", "transferência"]) {
    it(`${operacao} para turma encerrada é rejeitada sem alterações ou auditoria de sucesso`, async () => {
      turmas[1]!.ativa = false;
      const antes = { ...aluno };
      const resposta =
        operacao === "cadastro"
          ? await chamar("POST", "/admin/alunos", tokenEquipe(), dados())
          : await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados());
      assert.equal(resposta.status, 400);
      assert.deepEqual(aluno, antes);
      assert.equal(escritasAluno, 0);
      assert.equal(eventos.length, 0);
    });
  }

  it("permite cadastro em turma ativa", async () => {
    assert.equal((await chamar("POST", "/admin/alunos", tokenEquipe(), dados())).status, 201);
    assert.equal(escritasAluno, 1);
    assert.equal(eventos.length, 1);
  });

  it("permite transferir de turma encerrada para ativa", async () => {
    turmas[0]!.ativa = false;
    assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados())).status, 200);
    assert.equal(aluno.versaoAcesso, 2);
  });

  for (const turmaId of ["inexistente", "outra-escola"]) {
    it(`cadastro e transferência rejeitam destino ${turmaId}`, async () => {
      assert.equal((await chamar("POST", "/admin/alunos", tokenEquipe(), dados(turmaId))).status, 404);
      assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados(turmaId))).status, 404);
      assert.equal(escritasAluno, 0);
    });
  }

  it("matrícula duplicada impede transferência sem invalidar a sessão", async () => {
    duplicada = true;
    assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(), dados())).status, 409);
    assert.equal(aluno.versaoAcesso, 1);
    assert.equal(escritasAluno, 0);
  });

  it("conta inativa continua recusada", async () => {
    aluno.ativo = false;
    await verificarBloqueio(tokenAluno(), 401);
  });

  for (const papel of ["professor", "coordenacao"] as const) {
    it(`${papel} não pode cadastrar ou transferir alunos`, async () => {
      assert.equal((await chamar("POST", "/admin/alunos", tokenEquipe(papel), dados())).status, 403);
      assert.equal((await chamar("PUT", `/admin/alunos/${aluno.id}`, tokenEquipe(papel), dados())).status, 403);
      assert.equal(escritasAluno, 0);
    });
  }
});
