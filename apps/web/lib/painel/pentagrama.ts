import { dominioPorJeito, PONTAS_APRENDIZAGEM, type ResultadoJogada } from "@modolume/core";

export const PONTAS = PONTAS_APRENDIZAGEM;
export type Ponta = (typeof PONTAS)[number];
export interface ValorPonta {
  jeito: Ponta;
  aluno: number | null;
  confianca: "boa" | "pouca" | "nenhuma";
  turma: number | null;
  atividades: number;
  formatos: string[];
}

/** Mesmo domínio do app por aluno. Comparações de grupos dão peso igual a cada aluno. */
export function pentagrama(alunos: ResultadoJogada[][], referencia: ResultadoJogada[][]): ValorPonta[] {
  const meus = alunos.map(dominioPorJeito);
  const outros = referencia.map(dominioPorJeito);
  const media = (ns: (number | null)[]) => {
    const valores = ns.filter((v): v is number => v !== null);
    return valores.length ? Math.round(valores.reduce((s, v) => s + v, 0) / valores.length) : null;
  };
  return PONTAS.map((jeito, i) => ({
    jeito,
    confianca: meus.some((a) => a[i]!.confianca === "boa")
      ? "boa"
      : meus.some((a) => a[i]!.dominio !== null)
        ? "pouca"
        : "nenhuma",
    aluno: media(meus.map((a) => a[i]!.dominio)),
    turma: media(outros.map((a) => a[i]!.dominio)),
    atividades: meus.reduce((s, a) => s + a[i]!.atividades, 0),
    formatos: [...new Set(meus.flatMap((a) => a[i]!.formatos))],
  }));
}
