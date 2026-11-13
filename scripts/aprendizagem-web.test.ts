import assert from "node:assert/strict";
import { it } from "node:test";
import { insightsDoAluno } from "../apps/web/lib/painel/insights";

it("o painel preserva a indicação do núcleo quando o arredondamento empata dois jeitos", () => {
  const pontas = [
    {
      jeito: "Visual" as const,
      aluno: 76,
      turma: 75,
      atividades: 3,
      confianca: "boa" as const,
      formatos: ["Associação"],
    },
    { jeito: "Espacial" as const, aluno: 76, turma: 75, atividades: 3, confianca: "boa" as const, formatos: ["3D"] },
  ];
  const numeros = { nome: "Aluno", tentativas: 1, conclusao: 100, tendencia: 0 };
  assert.equal(insightsDoAluno(pontas, numeros, "Espacial").forte?.jeito, "Espacial");
  assert.equal(insightsDoAluno(pontas, numeros, null).forte, null);
});
