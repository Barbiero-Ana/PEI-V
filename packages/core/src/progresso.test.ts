import { describe, expect, it } from "vitest";
import { comprarItem, creditarJogada, progressoVazio } from "./progresso";
import { desafioDoDia } from "./constelacoes";
import { NIVEIS, type ResultadoJogada } from "./missoes";

const r = (id: string, missaoId = NIVEIS[0]!.missoes[0]!, acertosDePrimeira = 0): ResultadoJogada => ({
  id,
  missaoId,
  formato: "completar",
  rodadas: 2,
  acertosDePrimeira,
  tentativas: 4 - acertosDePrimeira,
  percentualConclusao: 100,
  percentualAcerto: acertosDePrimeira * 50,
  estrelas: 1,
  dicas: 0,
  tempoSegundos: 10,
  data: "2026-11-01",
});
describe("projeção do progresso por eventos", () => {
  it("soma jogadas distintas e conserva o mesmo total nas duas ordens", () => {
    const a = r("a"),
      b = r("b", undefined, 2);
    const ab = creditarJogada(creditarJogada(progressoVazio(), a), b);
    const ba = creditarJogada(creditarJogada(progressoVazio(), b), a);
    expect(ab).toEqual(ba);
    expect(ab.progresso[a.missaoId]!.jogadas).toBe(2);
  });
  it("bônus diário corresponde à melhor recompensa uma vez, sem depender da reconexão", () => {
    const a = r("a", desafioDoDia("2026-11-01").id),
      b = r("b", a.missaoId, 2);
    const ab = creditarJogada(creditarJogada(progressoVazio(), a), b);
    expect(ab).toEqual(creditarJogada(creditarJogada(progressoVazio(), b), a));
    expect(ab.bonusDiarios?.[a.data]).toBe(7);
    expect(Object.values(ab.pontosPorNivel).reduce((s, v) => s + v, 0)).toBe(19);
  });
  it("o preenchimento da constelação não multiplica o bônus ao mudar a ordem", () => {
    const eventos = [...NIVEIS[0]!.missoes.map((id, i) => r(String(i), id)), r("repetida")];
    const aplicar = (rs: ResultadoJogada[]) => rs.reduce(creditarJogada, progressoVazio());
    expect(aplicar(eventos)).toEqual(aplicar([...eventos].reverse()));
  });
  it("compra repetida não cobra duas vezes e compras distintas debitam o preço do catálogo", () => {
    const p = { ...progressoVazio(), pontosPorNivel: { "1": 40 } };
    const a = comprarItem(p, "acessorio:clownNose")!;
    expect(comprarItem(a, "acessorio:clownNose")).toEqual(a);
    const b = comprarItem(a, "acessorio:sleepMask")!;
    expect(b.gastos).toBe(18);
    expect(comprarItem(b, "capa-arcoiris")).toBeNull();
    expect(comprarItem(b, "item-inventado")).toBeNull();
    expect(comprarItem(b, "constructor")).toBeNull();
    expect(comprarItem(b, "__proto__")).toBeNull();
  });
});
