import { describe, expect, it } from "vitest";
import { desempenhoPorAluno, desempenhoPorFormato, evolucaoMensal, perfilDoAluno, resumoGeral } from "./indicators";
import { criarSeed } from "./seed";

const dados = criarSeed();

describe("indicadores do professor", () => {
  it("o resumo traz percentuais entre 0 e 100", () => {
    const r = resumoGeral(dados);
    expect(r.alunosAtivos).toBeGreaterThan(0);
    for (const v of [r.acertoMedio, r.conclusaoMedia]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("o filtro por turma só considera alunos daquela turma", () => {
    const turma = dados.turmas[0]!;
    const linhas = desempenhoPorAluno(dados, { turmaId: turma.id });
    expect(linhas.length).toBeGreaterThan(0);
    expect(linhas.every((l) => l.turmaId === turma.id)).toBe(true);
  });

  it("o desempenho por formato só lista formatos com jogadas", () => {
    expect(desempenhoPorFormato(dados).every((f) => f.amostra > 0)).toBe(true);
  });

  it("a evolução mensal sai em ordem cronológica", () => {
    const meses = evolucaoMensal(dados).map((p) => p.data);
    expect(meses).toEqual([...meses].sort());
  });

  it("os alunos saem ordenados do maior para o menor acerto", () => {
    const acertos = desempenhoPorAluno(dados).map((l) => l.acertoMedio);
    expect(acertos).toEqual([...acertos].sort((a, b) => b - a));
  });

  it("o perfil de um aluno inexistente é nulo", () => {
    expect(perfilDoAluno(dados, "nao-existe")).toBeNull();
  });
});
