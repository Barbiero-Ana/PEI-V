import { describe, expect, it } from "vitest";
import {
  MISSOES,
  NIVEIS,
  calcularResultado,
  missaoPorId,
  nivelAtual,
  nivelDaMissao,
  nivelLiberado,
  proximaMissao,
} from "./missoes";
import { constelacaoPorId } from "./constelacoes";

const concluidas = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, true]));

describe("catálogo de missões", () => {
  it("tem identificadores únicos", () => {
    const ids = MISSOES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda missão pertence a exatamente um mapa", () => {
    for (const m of MISSOES) {
      const mapas = NIVEIS.filter((n) => n.missoes.includes(m.id));
      expect(mapas, m.id).toHaveLength(1);
    }
  });

  it("todo mapa aponta para missões e constelação que existem", () => {
    for (const n of NIVEIS) {
      expect(constelacaoPorId(n.constelacao), `mapa ${n.numero}`).toBeDefined();
      for (const id of n.missoes) expect(missaoPorId(id), id).toBeDefined();
    }
  });

  it("os mapas são numerados em sequência a partir de 1", () => {
    expect(NIVEIS.map((n) => n.numero)).toEqual(NIVEIS.map((_, i) => i + 1));
  });

  it("toda fase tem situação do dia a dia e dica", () => {
    for (const m of MISSOES) {
      expect(m.rodadas.length, m.id).toBeGreaterThan(0);
      for (const r of m.rodadas) {
        expect(r.cenario.trim().length, m.id).toBeGreaterThan(0);
        expect(r.dica.trim().length, m.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("resultado da jogada", () => {
  const missao = MISSOES[0]!;

  it("3 estrelas com 90% ou mais de acerto de primeira", () => {
    const r = calcularResultado({ missao, errosPorRodada: [0, 0, 0], tempoSegundos: 40 });
    expect(r.percentualAcerto).toBe(100);
    expect(r.estrelas).toBe(3);
    expect(r.tentativas).toBe(3);
  });

  it("2 estrelas entre 60% e 89%", () => {
    const r = calcularResultado({ missao, errosPorRodada: [0, 0, 2], tempoSegundos: 40 });
    expect(r.percentualAcerto).toBe(67);
    expect(r.estrelas).toBe(2);
    expect(r.tentativas).toBe(5);
  });

  it("concluir sempre vale pelo menos 1 estrela", () => {
    const r = calcularResultado({ missao, errosPorRodada: [3, 4, 1], tempoSegundos: 90 });
    expect(r.acertosDePrimeira).toBe(0);
    expect(r.estrelas).toBe(1);
  });

  it("registra as dicas e o formato da missão", () => {
    const r = calcularResultado({ missao, errosPorRodada: [0, 1, 0], tempoSegundos: 12.6, dicas: 2 });
    expect(r.dicas).toBe(2);
    expect(r.formato).toBe(missao.formato);
    expect(r.tempoSegundos).toBe(13);
  });
});

describe("progressão entre mapas", () => {
  const mapa1 = NIVEIS[0]!;

  it("o mapa 1 está sempre liberado", () => {
    expect(nivelLiberado(1, {})).toBe(true);
  });

  it("o mapa 2 só abre com o mapa 1 inteiro concluído", () => {
    expect(nivelLiberado(2, concluidas(mapa1.missoes.slice(0, -1)))).toBe(false);
    expect(nivelLiberado(2, concluidas(mapa1.missoes))).toBe(true);
  });

  it("a opção de liberar todos abre qualquer mapa", () => {
    expect(nivelLiberado(NIVEIS.length, {}, true)).toBe(true);
  });

  it("sugere a primeira missão ainda não feita", () => {
    expect(proximaMissao({})?.id).toBe(mapa1.missoes[0]);
    expect(proximaMissao(concluidas([mapa1.missoes[0]!]))?.id).toBe(mapa1.missoes[1]);
  });

  it("o nível atual avança quando o mapa termina", () => {
    expect(nivelAtual({}).numero).toBe(1);
    expect(nivelAtual(concluidas(mapa1.missoes)).numero).toBe(2);
    expect(nivelDaMissao(mapa1.missoes[0]!)?.numero).toBe(1);
  });
});
