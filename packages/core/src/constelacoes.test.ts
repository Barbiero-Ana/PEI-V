import { describe, expect, it } from "vitest";
import {
  PONTOS_POR_ESTRELA,
  constelacaoDoNivel,
  desafioDoDia,
  estrelasAcesas,
  mapaConcluido,
  pontosDaJogada,
  pontosNecessarios,
} from "./constelacoes";
import { MISSOES, NIVEIS } from "./missoes";

const orion = constelacaoDoNivel(1);
const total = orion.estrelas.length;
const tudo = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, true]));

describe("pontos de luz", () => {
  it("valem fases + acertos de primeira + 3", () => {
    expect(pontosDaJogada({ rodadas: 4, acertosDePrimeira: 3 })).toBe(10);
  });

  it("dobram no desafio do dia", () => {
    expect(pontosDaJogada({ rodadas: 4, acertosDePrimeira: 3 }, true)).toBe(20);
  });
});

describe("estrelas da constelação", () => {
  it(`uma estrela acende a cada ${PONTOS_POR_ESTRELA} pontos`, () => {
    expect(estrelasAcesas(0, orion, false)).toBe(0);
    expect(estrelasAcesas(PONTOS_POR_ESTRELA - 1, orion, false)).toBe(0);
    expect(estrelasAcesas(PONTOS_POR_ESTRELA * 2, orion, false)).toBe(2);
  });

  it("sem o mapa concluído, para na penúltima estrela mesmo com pontos de sobra", () => {
    expect(estrelasAcesas(pontosNecessarios(orion) * 3, orion, false)).toBe(total - 1);
  });

  it("com o mapa concluído, acende a constelação inteira", () => {
    expect(estrelasAcesas(0, orion, true)).toBe(total);
  });
});

describe("mapa concluído", () => {
  const mapa1 = NIVEIS[0]!;

  it("exige todas as missões do mapa", () => {
    expect(mapaConcluido(1, tudo(mapa1.missoes.slice(1)))).toBe(false);
    expect(mapaConcluido(1, tudo(mapa1.missoes))).toBe(true);
  });

  it("é falso para um mapa que não existe", () => {
    expect(mapaConcluido(99, {})).toBe(false);
  });
});

describe("desafio do dia", () => {
  it("é o mesmo para todos na mesma data", () => {
    expect(desafioDoDia("2026-10-27").id).toBe(desafioDoDia("2026-10-27").id);
  });

  it("é sempre uma missão do catálogo", () => {
    for (const d of ["2026-01-01", "2026-06-15", "2026-12-31"]) {
      expect(MISSOES.map((m) => m.id)).toContain(desafioDoDia(d).id);
    }
  });
});
