import "reflect-metadata";
import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { ControladorAdministracao } from "./admin.js";
import { Banco, type Equipe, type PapelEquipe } from "./infra.js";

// Teste do controller com armazenamento transacional em memória: não instancia
// PrismaClient nem lê .env. Rollback real do PostgreSQL exige homologação separada.
const eu: Equipe = { id: "admin", nome: "Admin", papel: "admin", instituicaoId: "escola" };
function estadoInicial() {
  return {
    pessoa: {
      id: "professor",
      instituicaoId: "escola",
      nome: "Professor",
      email: "professor@teste.example",
      senhaProvisoria: true,
      papel: "professor" as PapelEquipe,
      disciplina: "Matemática" as string | null,
    },
    vinculos: [
      { professorId: "professor", turmaId: "turma-a" },
      { professorId: "professor", turmaId: "turma-b" },
      { professorId: "outro", turmaId: "turma-a" },
    ],
    atividades: [{ id: "atividade", professorId: "professor" }],
    planos: [{ id: "plano", professorId: "professor" }],
    historico: [{ id: "jogada", atividadeId: "atividade" }],
  };
}
type Estado = ReturnType<typeof estadoInicial>;
type Transacao = {
  registro: { create(evento: unknown): Promise<unknown> };
  professor: { update(args: { where: { id: string }; data: Partial<Estado["pessoa"]> }): Promise<unknown> };
  professorTurma: { deleteMany(args: { where: { professorId: string } }): Promise<unknown> };
};
let estado: Estado;
let falha: "update" | "delete" | undefined;
let transacoes: number;
let eventos: unknown[];
let outrosAdmins: number;
const banco = {
  professor: {
    findFirst: async ({ where }: { where: { id: string; instituicaoId: string } }) =>
      estado.pessoa.id === where.id && estado.pessoa.instituicaoId === where.instituicaoId
        ? { ...estado.pessoa }
        : null,
    findUnique: async () => null,
    count: async () => outrosAdmins,
    // Gravações fora do cliente transacional fariam o teste falhar.
    update: async () => {
      throw new Error("update fora da transação");
    },
  },
  professorTurma: {
    deleteMany: async () => {
      throw new Error("delete fora da transação");
    },
  },
  registro: {
    create: async (evento: unknown) => {
      eventos.push(evento);
      return {};
    },
  },
  $transaction: async (executar: (tx: Transacao) => Promise<unknown>) => {
    transacoes++;
    const rascunho = structuredClone(estado);
    const resultado = await executar({
      registro: banco.registro,
      professor: {
        update: async ({ where, data }) => {
          assert.equal(where.id, rascunho.pessoa.id);
          if (falha === "update") throw new Error("falha de atualização");
          Object.assign(rascunho.pessoa, data);
          return { ...rascunho.pessoa };
        },
      },
      professorTurma: {
        deleteMany: async ({ where }) => {
          // Confirma que a falha acontece depois da mudança no rascunho.
          assert.notEqual(rascunho.pessoa.papel, "professor");
          if (falha === "delete") throw new Error("falha de exclusão");
          rascunho.vinculos = rascunho.vinculos.filter((v) => v.professorId !== where.professorId);
          return {};
        },
      },
    });
    estado = rascunho;
    return resultado;
  },
};
const controller = new ControladorAdministracao(banco as unknown as Banco);
const dados = (papel: PapelEquipe) => ({
  nome: "Nome editado",
  email: "editado@teste.example",
  papel,
  disciplina: papel === "professor" ? "Matemática" : null,
});

describe("Alteração de papel da equipe (controller com transação simulada)", () => {
  beforeEach(() => {
    estado = estadoInicial();
    falha = undefined;
    transacoes = 0;
    eventos = [];
    outrosAdmins = 1;
  });

  it("não permite redirecionar a recuperação de uma conta com senha definida", async () => {
    estado.pessoa.senhaProvisoria = false;
    await assert.rejects(controller.editarUsuario(eu, "professor", dados("professor")), /senha definida/);
    assert.equal(estado.pessoa.email, "professor@teste.example");
    assert.equal(transacoes, 0);
  });

  for (const papel of ["coordenacao", "admin"] as const) {
    it(`professor → ${papel}: altera dados e remove apenas os seus vínculos, preservando histórico`, async () => {
      const antes = structuredClone(estado);
      assert.deepEqual(await controller.editarUsuario(eu, "professor", dados(papel)), { ok: true });
      assert.equal(estado.pessoa.papel, papel);
      assert.equal(estado.pessoa.nome, "Nome editado");
      assert.equal(estado.pessoa.email, "editado@teste.example");
      assert.deepEqual(estado.vinculos, [antes.vinculos[2]]);
      assert.deepEqual(estado.atividades, antes.atividades);
      assert.deepEqual(estado.planos, antes.planos);
      assert.deepEqual(estado.historico, antes.historico);
      assert.equal(transacoes, 1);
      assert.equal(eventos.length, 1);
    });

    it(`professor → ${papel}: falha na exclusão reverte todos os dados e não registra sucesso`, async () => {
      const antes = structuredClone(estado);
      falha = "delete";
      await assert.rejects(controller.editarUsuario(eu, "professor", dados(papel)), /falha de exclusão/);
      assert.deepEqual(estado, antes);
      assert.equal(transacoes, 1);
      assert.equal(eventos.length, 0);
    });

    it(`${papel} → professor: não restaura vínculos removidos`, async () => {
      await controller.editarUsuario(eu, "professor", dados(papel));
      const vinculos = structuredClone(estado.vinculos);
      await controller.editarUsuario(eu, "professor", dados("professor"));
      assert.equal(estado.pessoa.papel, "professor");
      assert.deepEqual(estado.vinculos, vinculos);
      assert.deepEqual(estado.historico, estadoInicial().historico);
    });
  }

  it("falha na atualização preserva os vínculos e todos os dados", async () => {
    const antes = structuredClone(estado);
    falha = "update";
    await assert.rejects(controller.editarUsuario(eu, "professor", dados("admin")), /falha de atualização/);
    assert.deepEqual(estado, antes);
    assert.equal(eventos.length, 0);
  });

  it("editar professor sem mudar papel mantém vínculos", async () => {
    const vinculos = structuredClone(estado.vinculos);
    await controller.editarUsuario(eu, "professor", dados("professor"));
    assert.deepEqual(estado.vinculos, vinculos);
  });

  it("recusa usuário de outra instituição antes de iniciar transação", async () => {
    estado.pessoa.instituicaoId = "outra-escola";
    await assert.rejects(controller.editarUsuario(eu, "professor", dados("admin")), /Pessoa não encontrada/);
    assert.equal(transacoes, 0);
  });

  it("preserva proteção de autorrebaixamento", async () => {
    estado.pessoa.id = eu.id;
    estado.pessoa.papel = "admin";
    await assert.rejects(controller.editarUsuario(eu, eu.id, dados("professor")), /próprio papel/);
    assert.equal(transacoes, 0);
  });

  it("preserva proteção do último administrador", async () => {
    estado.pessoa.papel = "admin";
    outrosAdmins = 0;
    await assert.rejects(controller.editarUsuario(eu, "professor", dados("coordenacao")), /administrador ativo/);
    assert.equal(transacoes, 0);
  });
});
