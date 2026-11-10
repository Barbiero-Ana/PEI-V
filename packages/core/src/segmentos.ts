export const SEGMENTOS = ["fundamental_i", "fundamental_ii", "medio"] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const NOME_SEGMENTO: Record<Segmento, string> = {
  fundamental_i: "Fundamental I",
  fundamental_ii: "Fundamental II",
  medio: "Ensino Médio",
};

export const SERIES_POR_SEGMENTO: Record<Segmento, string[]> = {
  fundamental_i: [1, 2, 3, 4, 5].map((ano) => `${ano}º ano`),
  fundamental_ii: [6, 7, 8, 9].map((ano) => `${ano}º ano`),
  medio: [1, 2, 3].map((ano) => `${ano}ª série`),
};
