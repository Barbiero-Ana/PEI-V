import { expect, it } from "vitest";
import { analisarAprendizagem } from "./aprendizagem";
import { dominioPorJeito, jogadasDeAprendizagem } from "./aprendizagem-painel";
import { calcularResultado, dataEscolar } from "./missoes";
import { esquemaAtividade } from "./atividades-professor";
import { esquemaAvaliacao } from "./avaliacao";
import type { DadosModolume } from "./entidade";

it("o painel conserva fases, dicas e tentativas e produz o mesmo domínio do app", () => {
  const r = {
    ...calcularResultado({
      missao: { id: "missao", formato: "completar" },
      errosPorRodada: [0, 2, 0],
      dicas: 1,
      tempoSegundos: 30,
    }),
    id: "jogada-1",
  };
  const dados = {
    instituicoes: [],
    professores: [],
    turmas: [],
    alunos: [],
    objetivos: [],
    atividades: [{ id: "missao", formato: "completar" }],
    aplicacoes: [{ id: "ap", atividadeId: "missao", data: r.data }],
    resultados: [{ ...r, aplicacaoId: "ap", alunoId: "a" }],
  } as unknown as DadosModolume;
  expect(analisarAprendizagem(jogadasDeAprendizagem(dados, "a"))).toEqual(analisarAprendizagem([r]));
  expect(dominioPorJeito([r]).find((j) => j.jeito === "Simbólico")!.dominio).toBe(
    analisarAprendizagem([r]).formatos.find((f) => f.formato === "completar")!.dominio,
  );
  expect(jogadasDeAprendizagem(dados, "outro")).toEqual([]);
});
it("recência é estável quando a API e o aparelho recebem a mesma data em ordens diferentes", () => {
  const a = {
    ...calcularResultado({ missao: { id: "m", formato: "completar" }, errosPorRodada: [0, 0], tempoSegundos: 10 }),
    id: "a",
  };
  const b = { ...a, id: "b", percentualAcerto: 0, acertosDePrimeira: 0, tentativas: 8 };
  expect(analisarAprendizagem([a, b])).toEqual(analisarAprendizagem([b, a]));
});
it("não publica devolutiva vazia nem aceita data limite anterior à liberação", () => {
  expect(
    esquemaAvaliacao.safeParse({
      id: "57ab0324-0307-471c-b679-402bd6777715",
      jogadaId: "jogada-1",
      feedback: "  ",
      publicar: true,
    }).success,
  ).toBe(false);
  expect(
    esquemaAvaliacao.safeParse({
      id: "57ab0324-0307-471c-b679-402bd6777715",
      jogadaId: "jogada-1",
      feedback: "",
      publicar: false,
    }).success,
  ).toBe(true);
  const atividade = {
    titulo: "Atividade",
    formato: "pronta",
    missaoId: "inexistente",
    instrucao: "",
    habilidade: "",
    planoId: "",
    questoes: [],
    turmas: ["t"],
    liberarEm: "2026-11-11",
    prazo: "2026-11-10",
  };
  const resultado = esquemaAtividade.safeParse(atividade);
  expect(resultado.success).toBe(false);
  if (!resultado.success) expect(resultado.error.issues.some((i) => i.path[0] === "prazo")).toBe(true);
});

it("o prazo usa o calendário escolar em hosts UTC e produz ISO sem depender do formato da localidade", () => {
  expect(dataEscolar(new Date("2026-11-12T02:59:59Z"))).toBe("2026-11-11");
  expect(dataEscolar(new Date("2026-11-12T03:00:00Z"))).toBe("2026-11-12");
});
