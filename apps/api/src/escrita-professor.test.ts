import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { Module, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UNIDADES_TEMATICAS } from "@modolume/core";
import { ControladorProfessor } from "./professor.js";
import { Banco } from "./infra.js";

// Aplicação HTTP real; armazenamento exclusivo do teste, sem PrismaClient ou .env.
function inicial() {
  return {
    atividade: {
      id: "atividade",
      professorId: "professor",
      titulo: "Atividade teste",
      formato: "objetiva",
      instrucao: "",
      habilidadeCodigo: null,
      missaoId: null,
      planoId: null as string | null,
      liberarEm: new Date("2026-11-01"),
      status: "rascunho",
      enviadaEm: null,
      atualizadoEm: new Date("2026-11-01"),
      turmas: [{ turmaId: "a" }, { turmaId: "b" }],
      questoes: [
        {
          ordem: 0,
          tipo: "objetiva",
          enunciado: "Questão original",
          feedbackErro: "Releia o enunciado e confira a condição.",
          opcoes: [
            { texto: "Sim", correta: true },
            { texto: "Não", correta: false },
          ],
        },
      ],
    },
    plano: {
      id: "plano",
      professorId: "professor",
      turmaId: "a",
      tema: "Plano teste",
      data: new Date("2026-11-01"),
      horario: "",
      aulas: 1,
      unidadeNome: UNIDADES_TEMATICAS[0],
      habilidades: [],
      formatos: [],
      missoes: [],
      alunosFoco: [],
      objetivos: "Objetivo original",
      conteudos: "Conteúdo original",
      metodologia: "",
      recursos: "",
      avaliacao: "",
      observacoes: "",
      registro: "Histórico da aula",
      status: "planejada",
      atualizadoEm: new Date("2026-11-01"),
    },
    jogadas: [{ id: "jogada", atividadeId: "atividade", alunoId: "aluno" }],
  };
}
let estado = inicial();
let vinculos: Set<string>;
let ativa: boolean;
let instituicao: string;
let escritas: number;
let eventos: unknown[];
type Filtro = {
  id?: { in: string[] };
  ativa?: boolean;
  instituicaoId: string;
  professores?: { some: { professorId: string } };
};
function permitida(turmaId: string, filtro: Filtro) {
  return (
    filtro.instituicaoId === instituicao &&
    (!filtro.ativa || ativa) &&
    (!filtro.professores || (filtro.professores.some.professorId === "professor" && vinculos.has(turmaId))) &&
    (!filtro.id || filtro.id.in.includes(turmaId))
  );
}
const banco = {
  $transaction: async (executar: (transacao: unknown) => Promise<unknown>) => executar(banco),
  professor: {
    findUnique: async () => ({
      id: "professor",
      nome: "Professor",
      papel: "professor",
      ativo: true,
      senhaProvisoria: false,
      versaoAcesso: 1,
      instituicaoId: "escola",
    }),
  },
  turma: {
    findMany: async ({ where }: { where: Filtro }) =>
      ["a", "b", "c"].filter((id) => permitida(id, where)).map((id) => ({ id })),
  },
  atividadeProfessor: {
    findFirst: async ({ where }: { where: { id: string; professorId: string } }) =>
      where.id === estado.atividade.id && where.professorId === estado.atividade.professorId
        ? structuredClone(estado.atividade)
        : null,
    update: async ({
      data,
    }: {
      data: { titulo?: string; status?: string; turmas?: { create: { turmaId: string }[] } };
    }) => {
      escritas++;
      if (data.titulo) estado.atividade.titulo = data.titulo;
      if (data.status) estado.atividade.status = data.status;
      if (data.turmas) estado.atividade.turmas = data.turmas.create;
      return structuredClone(estado.atividade);
    },
    create: async () => {
      escritas++;
      return structuredClone(estado.atividade);
    },
    delete: async () => {
      escritas++;
      return {};
    },
  },
  planoAula: {
    findFirst: async ({ where }: { where: { id: string; professorId: string; turma: Filtro } }) =>
      where.id === estado.plano.id &&
      where.professorId === estado.plano.professorId &&
      permitida(estado.plano.turmaId, where.turma)
        ? structuredClone(estado.plano)
        : null,
    update: async ({ data }: { data: { turmaId: string; tema: string } }) => {
      escritas++;
      estado.plano.turmaId = data.turmaId;
      estado.plano.tema = data.tema;
      return structuredClone(estado.plano);
    },
    create: async () => {
      escritas++;
      return structuredClone(estado.plano);
    },
    delete: async () => {
      escritas++;
      return {};
    },
  },
  missao: { findMany: async () => [] },
  aluno: { findMany: async () => [] },
  registro: {
    create: async (evento: unknown) => {
      eventos.push(evento);
      return {};
    },
  },
};
const dadosAtividade = (turmas = ["a", "b"], planoId = "") => ({
  titulo: "Atividade editada",
  formato: "objetiva",
  instrucao: "",
  habilidade: "",
  missaoId: "",
  questoes: [{ tipo: "objetiva", enunciado: "Qual alternativa?", alternativas: ["Sim", "Não"], correta: 0 }],
  turmas,
  liberarEm: "2026-11-01",
  planoId,
});
const dadosPlano = (turmaId = "a") => ({
  turmaId,
  data: "2026-11-01",
  horario: "",
  aulas: 1,
  tema: "Plano editado",
  unidade: UNIDADES_TEMATICAS[0],
  habilidades: [],
  objetivos: "Objetivo",
  conteudos: "Conteúdo",
  metodologia: "",
  formatos: [],
  atividadesApp: [],
  recursos: "",
  avaliacao: "",
  alunosFoco: [],
  observacoes: "",
  status: "planejada",
  registro: "Registro",
});
@Module({
  imports: [JwtModule.register({ global: true, secret: "somente-testes-escrita-professor" })],
  controllers: [ControladorProfessor],
  providers: [{ provide: Banco, useValue: banco }],
})
class ModuloTeste {}

describe("Escrita após perda do vínculo (HTTP, banco simulado)", () => {
  let app: INestApplication;
  let url: string;
  let token: string;
  before(async () => {
    app = await NestFactory.create(ModuloTeste, { logger: false });
    await app.listen(0, "127.0.0.1");
    url = await app.getUrl();
    token = app.get(JwtService).sign({ sub: "professor", papel: "professor", v: 1 });
  });
  after(async () => {
    await app?.close();
  });
  beforeEach(() => {
    estado = inicial();
    vinculos = new Set(["a", "b", "c"]);
    ativa = true;
    instituicao = "escola";
    escritas = 0;
    eventos = [];
  });
  const chamar = (metodo: string, caminho: string, corpo?: unknown) =>
    fetch(`${url}/professor/${caminho}`, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  async function recusada(metodo: string, caminho: string, corpo?: unknown, status = 403) {
    const antes = structuredClone(estado);
    const gravacoes = escritas;
    const auditoria = eventos.length;
    const r = await chamar(metodo, caminho, corpo);
    assert.equal(r.status, status, `${metodo} ${caminho}: ${await r.text()}`);
    assert.deepEqual(estado, antes);
    assert.equal(escritas, gravacoes);
    assert.equal(eventos.length, auditoria);
  }
  for (const perda of ["total", "parcial", "encerrada", "outra instituição"]) {
    it(`${perda}: recusa edição, envio, recolhimento e exclusão sem alterar conteúdo`, async () => {
      if (perda === "total") vinculos.clear();
      if (perda === "parcial") vinculos.delete("a");
      if (perda === "encerrada") ativa = false;
      if (perda === "outra instituição") instituicao = "outra";
      await recusada("PUT", "atividades/atividade", dadosAtividade(["b"]));
      for (const enviar of [true, false]) await recusada("POST", "atividades/atividade/envio", { enviar });
      await recusada("DELETE", "atividades/atividade");
      const status = perda === "outra instituição" ? 404 : 403;
      await recusada("PUT", "planos/plano", dadosPlano("b"), status);
      await recusada("DELETE", "planos/plano", undefined, status);
    });
  }
  it("valida o destino solicitado mesmo quando o original continua autorizado", async () => {
    vinculos.delete("c");
    await recusada("PUT", "atividades/atividade", dadosAtividade(["c"]));
    await recusada("PUT", "planos/plano", dadosPlano("c"));
    await recusada("POST", "atividades", dadosAtividade(["c"]));
  });
  it("impede marcar uma aula futura como realizada ou registrar a aula por requisição direta", async () => {
    await recusada("PUT", "planos/plano", { ...dadosPlano(), data: "2999-01-01", registro: "Antes da aula" }, 400);
    await recusada(
      "PUT",
      "planos/plano",
      { ...dadosPlano(), data: "2999-01-01", registro: "", status: "realizada" },
      400,
    );
  });
  it("novo vínculo a outra turma não permite contornar a perda do vínculo original", async () => {
    vinculos.delete("a");
    await recusada("PUT", "atividades/atividade", dadosAtividade(["c"]));
    await recusada("PUT", "planos/plano", dadosPlano("c"));
  });
  it("criação/edição de atividade exige autorização atual sobre o plano solicitado", async () => {
    estado.atividade.turmas = [{ turmaId: "b" }];
    vinculos.delete("a");
    await recusada("POST", "atividades", dadosAtividade(["b"], "plano"), 400);
    await recusada("PUT", "atividades/atividade", dadosAtividade(["b"], "plano"), 400);
  });
  it("não permite remover referência ao plano antigo para contornar autorização", async () => {
    estado.atividade.turmas = [{ turmaId: "b" }];
    estado.atividade.planoId = "plano";
    vinculos.delete("a");
    await recusada("PUT", "atividades/atividade", dadosAtividade(["b"]));
    await recusada("POST", "atividades/atividade/envio", { enviar: true });
    await recusada("DELETE", "atividades/atividade");
  });
  it("conteúdo de outro autor não é revelado nem alterado", async () => {
    estado.atividade.professorId = "outro";
    estado.plano.professorId = "outro";
    await recusada("PUT", "atividades/atividade", dadosAtividade(), 404);
    await recusada("DELETE", "atividades/atividade", undefined, 404);
    await recusada("POST", "atividades/atividade/envio", { enviar: true }, 404);
    await recusada("PUT", "planos/plano", dadosPlano(), 404);
    await recusada("DELETE", "planos/plano", undefined, 404);
    await recusada("POST", "atividades", dadosAtividade(["a"], "plano"), 400);
  });
  it("perder vínculo com turma não envolvida preserva o fluxo autorizado", async () => {
    vinculos.delete("c");
    assert.equal((await chamar("POST", "atividades", dadosAtividade(["a"], "plano"))).status, 201);
    assert.equal((await chamar("PUT", "atividades/atividade", dadosAtividade())).status, 200);
    for (const enviar of [true, false]) {
      const r = await chamar("POST", "atividades/atividade/envio", { enviar });
      assert.equal(r.status, 201);
      assert.equal(((await r.json()) as { status: string }).status, enviar ? "enviada" : "rascunho");
    }
    assert.equal((await chamar("PUT", "planos/plano", dadosPlano("b"))).status, 200);
    assert.equal((await chamar("POST", "planos", dadosPlano("b"))).status, 201);
    assert.equal((await chamar("DELETE", "atividades/atividade")).status, 200);
    assert.equal((await chamar("DELETE", "planos/plano")).status, 200);
  });
  it("a mesma sessão é recusada após remoção do vínculo", async () => {
    assert.equal((await chamar("POST", "atividades/atividade/envio", { enviar: true })).status, 201);
    vinculos.delete("a");
    await recusada("POST", "atividades/atividade/envio", { enviar: false });
  });
});
