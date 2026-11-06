import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Module, type INestApplication } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { NestFactory } from "@nestjs/core";
import { ProfessorController } from "./professor.js";
import { Banco } from "./infra.js";

// HTTP real, armazenamento somente em memória. Não instancia PrismaClient ou lê .env.
const turmas = [
  { id: "a", instituicaoId: "escola", ativa: true },
  { id: "b", instituicaoId: "escola", ativa: true },
  { id: "externa", instituicaoId: "outra", ativa: true },
];
const alunos = turmas.map((t) => ({
  id: `aluno-${t.id}`,
  turmaId: t.id,
  nome: `Aluno ${t.id}`,
  ativo: true,
  avatar: { svg: "<svg/>" },
}));
const jogadas = alunos.map((a) => ({
  alunoId: a.id,
  atividadeId: "atividade",
  percentualAcerto: 80,
  data: new Date("2026-11-01"),
}));
const planos = turmas.map((t) => ({
  id: `plano-${t.id}`,
  professorId: "professor",
  turmaId: t.id,
  data: new Date("2026-11-01"),
  horario: "",
  aulas: 1,
  tema: `Tema ${t.id}`,
  unidadeNome: "Números",
  habilidades: [],
  formatos: [],
  missoes: [],
  alunosFoco: [{ alunoId: `aluno-${t.id}` }],
  objetivos: "",
  conteudos: "",
  metodologia: "",
  recursos: "",
  avaliacao: "",
  observacoes: "Observação de teste",
  status: "planejada",
  registro: "Registro de teste",
  atualizadoEm: new Date("2026-11-01"),
}));
type FiltroTurma = {
  ativa: boolean;
  instituicaoId: string;
  professores: { some: { professorId: string } };
  id?: { in: string[] };
};
type FiltroAluno = { ativo: boolean; turmaId: { in: string[] }; turma: FiltroTurma };
type ConsultaPlano = {
  where: { professorId: string; id?: string; turmaId?: string; status?: string; turma: FiltroTurma };
  include: { alunosFoco: { where: { aluno: { turma: FiltroTurma } } } };
};
let vinculos: Set<string>;
let papel: string;
let autorAtividade: string;
let consultasJogadas: FiltroAluno[];
let consultasAlunos: number;
function turmaPermitida(id: string, filtro: FiltroTurma) {
  // Não permite que o fake mascare uma consulta sem filtro de autorização.
  assert.equal(filtro.ativa, true);
  assert.equal(filtro.instituicaoId, "escola");
  assert.equal(filtro.professores.some.professorId, "professor");
  const t = turmas.find((t) => t.id === id);
  return Boolean(
    t?.ativa &&
    t.instituicaoId === filtro.instituicaoId &&
    vinculos.has(id) &&
    (!filtro.id || filtro.id.in.includes(id)),
  );
}
function alunoPermitido(a: (typeof alunos)[number], filtro: FiltroAluno) {
  assert.equal(filtro.ativo, true);
  return a.ativo && filtro.turmaId.in.includes(a.turmaId) && turmaPermitida(a.turmaId, filtro.turma);
}
function consultarPlanos({ where, include }: ConsultaPlano) {
  return planos
    .filter(
      (p) =>
        p.professorId === where.professorId &&
        (!where.id || p.id === where.id) &&
        (!where.turmaId || p.turmaId === where.turmaId) &&
        (!where.status || p.status === where.status) &&
        turmaPermitida(p.turmaId, where.turma),
    )
    .map((p) => ({
      ...p,
      alunosFoco: p.alunosFoco.filter((f) => {
        const aluno = alunos.find((a) => a.id === f.alunoId)!;
        return turmaPermitida(aluno.turmaId, include.alunosFoco.where.aluno.turma);
      }),
    }));
}
const banco = {
  professor: {
    findUnique: async () => ({
      id: "professor",
      nome: "Professor",
      papel,
      ativo: true,
      instituicaoId: "escola",
      senhaProvisoria: false,
    }),
  },
  atividadeProfessor: {
    findFirst: async ({ where }: { where: { id: string; professorId: string } }) =>
      where.id === "atividade" && where.professorId === autorAtividade
        ? { id: "atividade", turmas: turmas.map((t) => ({ turmaId: t.id })) }
        : null,
  },
  turma: {
    findMany: async ({ where }: { where: FiltroTurma }) =>
      turmas.filter((t) => turmaPermitida(t.id, where)).map((t) => ({ id: t.id })),
  },
  aluno: {
    findMany: async ({ where }: { where: FiltroAluno }) => {
      consultasAlunos++;
      return alunos.filter((a) => alunoPermitido(a, where));
    },
  },
  jogada: {
    findMany: async ({ where }: { where: { atividadeId: string; aluno: FiltroAluno } }) => {
      assert.equal(where.atividadeId, "atividade");
      assert.ok(where.aluno, "a consulta das jogadas precisa ser limitada no banco");
      consultasJogadas.push(structuredClone(where.aluno));
      return jogadas.filter((j) =>
        alunoPermitido(
          alunos.find((a) => a.id === j.alunoId)!,
          where.aluno,
        ),
      );
    },
  },
  planoAula: {
    findMany: async (q: ConsultaPlano) => consultarPlanos(q),
    findFirst: async (q: ConsultaPlano) => consultarPlanos(q)[0] ?? null,
  },
};
@Module({
  imports: [JwtModule.register({ global: true, secret: "somente-testes-leitura-professor" })],
  controllers: [ProfessorController],
  providers: [{ provide: Banco, useValue: banco }],
})
class ModuloTeste {}

describe("Leitura do professor após desvinculação (HTTP, banco simulado)", () => {
  let app: INestApplication;
  let url: string;
  let token: string;
  let jwt: JwtService;
  before(async () => {
    app = await NestFactory.create(ModuloTeste, { logger: false });
    await app.listen(0, "127.0.0.1");
    url = await app.getUrl();
    jwt = app.get(JwtService);
    token = jwt.sign({ sub: "professor", papel: "professor" });
  });
  after(async () => {
    await app?.close();
  });
  beforeEach(() => {
    vinculos = new Set(["a", "b"]);
    papel = "professor";
    autorAtividade = "professor";
    consultasJogadas = [];
    consultasAlunos = 0;
    turmas.forEach((t) => {
      t.ativa = true;
    });
    alunos.forEach((a, i) => {
      a.turmaId = turmas[i]!.id;
    });
  });
  const get = (caminho: string, bearer: string | null = token) =>
    fetch(`${url}/professor/${caminho}`, {
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
    });
  async function idsPlanos(caminho = "planos") {
    const r = await get(caminho);
    assert.equal(r.status, 200);
    return ((await r.json()) as { id: string }[]).map((p) => p.id);
  }
  async function idsAlunos() {
    const r = await get("atividades/atividade/situacao");
    assert.equal(r.status, 200);
    return ((await r.json()) as { alunos: { id: string; acerto: number }[] }).alunos.map((a) => {
      assert.equal(a.acerto, 80);
      return a.id;
    });
  }
  it("situação antes e depois de perder um vínculo mantém apenas alunos e jogadas autorizados", async () => {
    assert.deepEqual(await idsAlunos(), ["aluno-a", "aluno-b"]);
    vinculos.delete("a");
    assert.deepEqual(await idsAlunos(), ["aluno-b"]);
    assert.deepEqual(consultasJogadas.at(-1)?.turmaId.in, ["b"]);
  });
  it("sem destinatário autorizado retorna 403 antes de consultar alunos ou jogadas", async () => {
    vinculos.clear();
    const r = await get("atividades/atividade/situacao");
    assert.equal(r.status, 403);
    assert.equal(consultasAlunos, 0);
    assert.equal(consultasJogadas.length, 0);
    assert.ok(!JSON.stringify(await r.json()).includes("aluno-a"));
  });
  it("planos antes e depois da desvinculação preservam acesso à outra turma com o mesmo JWT", async () => {
    assert.deepEqual(await idsPlanos(), ["plano-a", "plano-b"]);
    assert.equal((await get("planos/plano-a")).status, 200);
    vinculos.delete("a");
    assert.deepEqual(await idsPlanos(), ["plano-b"]);
    assert.equal((await get("planos/plano-a")).status, 404);
    assert.equal((await get("planos/plano-b")).status, 200);
    assert.deepEqual(await idsPlanos("planos?turmaId=a"), []);
    assert.deepEqual(await idsPlanos("planos?turmaId=b&status=planejada"), ["plano-b"]);
  });
  it("ausência total de vínculos oculta lista e detalhes dos planos", async () => {
    vinculos.clear();
    assert.deepEqual(await idsPlanos(), []);
    assert.equal((await get("planos/plano-a")).status, 404);
  });
  it("turma encerrada é excluída da situação e dos planos", async () => {
    turmas[0]!.ativa = false;
    assert.deepEqual(await idsAlunos(), ["aluno-b"]);
    assert.deepEqual(await idsPlanos(), ["plano-b"]);
    assert.equal((await get("planos/plano-a")).status, 404);
    turmas[1]!.ativa = false;
    assert.equal((await get("atividades/atividade/situacao")).status, 403);
  });
  it("outra instituição é recusada mesmo com vínculo inconsistente e autoria", async () => {
    vinculos = new Set(["externa"]);
    assert.deepEqual(await idsPlanos(), []);
    assert.equal((await get("planos/plano-externa")).status, 404);
    assert.equal((await get("atividades/atividade/situacao")).status, 403);
    assert.equal(consultasJogadas.length, 0);
  });
  it("retira dos alunos acompanhados o ID de aluno transferido para turma sem autorização", async () => {
    alunos[0]!.turmaId = "externa";
    for (const caminho of ["planos/plano-a", "planos?turmaId=a"]) {
      const r = await get(caminho);
      assert.equal(r.status, 200);
      const dados = (await r.json()) as { alunosFoco: string[] } | { alunosFoco: string[] }[];
      assert.deepEqual((Array.isArray(dados) ? dados[0]! : dados).alunosFoco, []);
    }
  });
  it("autoria continua obrigatória mesmo com vínculo atual", async () => {
    autorAtividade = "outro";
    assert.equal((await get("atividades/atividade/situacao")).status, 404);
    const outro = jwt.sign({ sub: "outro", papel: "professor" });
    // A guarda consulta o papel da conta; o conteúdo continua recortado pelo sub.
    assert.deepEqual(await (await get("planos", outro)).json(), []);
    assert.equal((await get("planos/plano-a", outro)).status, 404);
  });
  it("exige autenticação e papel professor", async () => {
    for (const caminho of ["planos", "planos/plano-a", "atividades/atividade/situacao"]) {
      assert.equal((await get(caminho, null)).status, 401);
      assert.equal((await get(caminho, jwt.sign({ sub: "professor", papel: "admin" }))).status, 403);
    }
    papel = "coordenacao";
    assert.equal((await get("planos")).status, 401);
  });
});
