import { describe, expect, it } from "vitest";
import { esquemaData, normalizarBusca, numeroDaPagina } from "./validacao";
import { esquemaPlano, PLANOS_EXEMPLO } from "./planejamento";

describe("Validações compartilhadas", () => {
  it("recusa dias inexistentes e aceita ano bissexto", () => {
    for (const data of ["2026-02-29", "2026-04-31", "2026-13-01", "2026-00-10"])
      expect(esquemaData.safeParse(data).success).toBe(false);
    expect(esquemaData.parse("2024-02-29")).toBe("2024-02-29");
  });
  it("não envia deslocamentos fracionários ou infinitos ao banco", () => {
    expect(["2.5", "Infinity", "NaN", "-10", "99999"].map((valor) => numeroDaPagina(valor))).toEqual([
      2, 1, 1, 1, 1000,
    ]);
  });
  it("pesquisa sem diferenciar acentos ou caixa", () => {
    expect(normalizarBusca("  JOÃO Ávila ")).toBe("joao avila");
  });
  it("recusa horários fora do relógio", () => {
    for (const horario of ["24:00", "12:60", "99:99"])
      expect(esquemaPlano.safeParse({ ...PLANOS_EXEMPLO[0], horario }).success).toBe(false);
    expect(esquemaPlano.safeParse({ ...PLANOS_EXEMPLO[0], horario: "23:59" }).success).toBe(true);
  });
});
