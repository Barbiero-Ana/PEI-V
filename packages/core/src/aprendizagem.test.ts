import { describe, expect, it } from "vitest";
import { analisarAprendizagem } from "./aprendizagem";
import type { FormatoId } from "./formato";
import type { ResultadoJogada } from "./missoes";

/** Jogada de teste: `acertos` de `rodadas` fases acertadas de primeira. */
function jogada(
  formato: FormatoId,
  acertos: number,
  rodadas = 4,
  extra: Partial<ResultadoJogada> = {},
): ResultadoJogada {
  return {
    missaoId: `teste-${formato}`,
    formato,
    rodadas,
    acertosDePrimeira: acertos,
    tentativas: rodadas + (rodadas - acertos),
    percentualConclusao: 100,
    percentualAcerto: Math.round((acertos / rodadas) * 100),
    tempoSegundos: 60,
    estrelas: 3,
    dicas: 0,
    data: "2026-10-01",
    ...extra,
  };
}

const doFormato = (r: ReturnType<typeof analisarAprendizagem>, f: FormatoId) =>
  r.formatos.find((x) => x.formato === f)!;

describe("análise de aprendizagem", () => {
  it("sem jogadas, todos os formatos aparecem como novos e não há conclusão", () => {
    const r = analisarAprendizagem([]);
    expect(r.formatos.every((f) => f.nivel === "novo")).toBe(true);
    expect(r.jeitoPrincipal).toBeNull();
  });

  it("domínio = 65% acerto + 20% autonomia + 15% precisão", () => {
    // tudo de primeira e sem dica: acerto 100, autonomia 100, precisão 100
    const perfeito = analisarAprendizagem([jogada("associacao-visual", 4), jogada("associacao-visual", 4)]);
    expect(doFormato(perfeito, "associacao-visual").dominio).toBe(100);

    // metade de primeira, sem dica: 1,5 tentativa por fase → precisão 75
    const metade = analisarAprendizagem([jogada("sequencia", 2), jogada("sequencia", 2)]);
    const f = doFormato(metade, "sequencia");
    expect(f.acerto).toBe(50);
    expect(f.autonomia).toBe(100);
    expect(f.dominio).toBe(Math.round(50 * 0.65 + 100 * 0.2 + 75 * 0.15));
  });

  it("pedir dica reduz a autonomia, mas não o acerto", () => {
    const r = analisarAprendizagem([jogada("montagem", 4, 4, { dicas: 2 }), jogada("montagem", 4, 4, { dicas: 2 })]);
    const f = doFormato(r, "montagem");
    expect(f.acerto).toBe(100);
    expect(f.autonomia).toBe(50);
  });

  it("classifica o nível pelo domínio", () => {
    const r = analisarAprendizagem([
      jogada("associacao-visual", 4),
      jogada("associacao-visual", 4),
      jogada("sequencia", 0),
      jogada("sequencia", 0),
    ]);
    expect(doFormato(r, "associacao-visual").nivel).toBe("forte");
    expect(doFormato(r, "sequencia").nivel).toBe("treinar");
  });

  it("uma jogada só não basta para apontar o jeito de aprender", () => {
    const r = analisarAprendizagem([jogada("associacao-visual", 4)]);
    expect(doFormato(r, "associacao-visual").confianca).toBe("pouca");
    expect(r.jeitoPrincipal).toBeNull();
  });

  it("com dados suficientes, aponta o jeito principal", () => {
    const r = analisarAprendizagem([jogada("associacao-visual", 4), jogada("associacao-visual", 4)]);
    expect(r.jeitoPrincipal?.jeito).toBe("Visual");
  });

  it("detecta quando o aluno está melhorando", () => {
    const r = analisarAprendizagem([
      jogada("manipulacao", 1),
      jogada("manipulacao", 1),
      jogada("manipulacao", 4),
      jogada("manipulacao", 4),
    ]);
    expect(doFormato(r, "manipulacao").tendencia).toBe("subindo");
  });

  it("sugere treinar o formato mais fraco", () => {
    const r = analisarAprendizagem([
      jogada("associacao-visual", 4),
      jogada("associacao-visual", 4),
      jogada("sequencia", 0),
      jogada("sequencia", 0),
    ]);
    expect(r.sugestao?.motivo).toContain("sequência");
  });
});
