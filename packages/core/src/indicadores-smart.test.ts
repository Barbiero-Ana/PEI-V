import { describe, expect, it } from "vitest";
import { INDICADORES_SMART, indicadoresSmart, somarDias, situacaoDaMeta } from "./indicadores-smart";
import { criarDadosDemonstracao } from "./dados-demonstracao";

const dados = criarDadosDemonstracao();

describe("indicadores SMART", () => {
  it("todo indicador tem as cinco partes SMART e uma meta", () => {
    for (const i of INDICADORES_SMART) {
      for (const parte of [i.especifico, i.mensuravel, i.atingivel, i.relevante, i.temporal, i.acao]) {
        expect(parte.length).toBeGreaterThan(10);
      }
      expect(i.meta.valor).toBeGreaterThan(0);
    }
  });

  it("a janela tem 4 semanas e termina na atividade mais recente", () => {
    const { janela, anterior, proximaRevisao } = indicadoresSmart(dados);
    const ultima = dados.aplicacoes
      .map((a) => a.data)
      .sort()
      .at(-1)!;
    expect(janela.fim).toBe(ultima);
    expect(janela.inicio).toBe(somarDias(ultima, -27));
    expect(anterior.fim).toBe(somarDias(janela.inicio, -1));
    expect(proximaRevisao).toBe(somarDias(ultima, 28));
  });

  it("os percentuais ficam entre 0 e 100", () => {
    const turma = dados.turmas[0]!;
    const { indicadores } = indicadoresSmart(dados, { turmaId: turma.id });
    for (const i of indicadores.filter((x) => x.meta.unidade === "%" && x.valor !== null)) {
      expect(i.valor!).toBeGreaterThanOrEqual(0);
      expect(i.valor!).toBeLessThanOrEqual(100);
    }
  });

  it("o formato com menor acerto vem com o nome do formato", () => {
    const ind = indicadoresSmart(dados).indicadores.find((i) => i.id === "IND-03")!;
    expect(ind.valor).not.toBeNull();
    expect(ind.detalhe).toBeTruthy();
  });

  it("sem atividades na janela, os indicadores ficam sem dados", () => {
    const { indicadores, atingidas } = indicadoresSmart(dados, { referencia: "2020-01-01" });
    expect(indicadores.every((i) => i.status === "sem-dados")).toBe(true);
    expect(atingidas).toBe(0);
  });

  it("a situação respeita o sentido e a tolerância da meta", () => {
    const minimo = { valor: 70, sentido: "minimo", unidade: "%", tolerancia: 5 } as const;
    expect(situacaoDaMeta(72, minimo)).toBe("atingida");
    expect(situacaoDaMeta(66, minimo)).toBe("perto");
    expect(situacaoDaMeta(50, minimo)).toBe("abaixo");
    const maximo = { valor: 1.8, sentido: "maximo", unidade: "tentativas", tolerancia: 0.3 } as const;
    expect(situacaoDaMeta(1.5, maximo)).toBe("atingida");
    expect(situacaoDaMeta(2, maximo)).toBe("perto");
    expect(situacaoDaMeta(2.5, maximo)).toBe("abaixo");
    expect(situacaoDaMeta(null, maximo)).toBe("sem-dados");
  });
});
