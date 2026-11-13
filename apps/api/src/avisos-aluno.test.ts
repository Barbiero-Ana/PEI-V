import "reflect-metadata";
import assert from "node:assert/strict";
import { it } from "node:test";
import { avisosDoAluno } from "./avisos-aluno.js";
import type { Banco } from "./infra.js";

it("a data da devolutiva no aviso segue o calendário escolar e não a virada UTC", async () => {
  const banco = {
    atividadeProfessor: { findMany: async () => [] },
    avaliacaoAtividade: {
      findMany: async () => [
        {
          id: "avaliacao",
          atividadeId: "atividade",
          tituloAtividade: "Título preservado",
          criadaEm: new Date("2026-11-12T02:59:59Z"),
        },
      ],
    },
    jogada: { findMany: async () => [] },
    leituraAvisoAluno: { findMany: async () => [] },
  } as unknown as Banco;
  const avisos = await avisosDoAluno(banco, { sub: "aluno", papel: "aluno", turmaId: "turma" });
  assert.equal(avisos[0]?.data, "2026-11-11");
  assert.equal(avisos[0]?.texto, "Título preservado");
});
