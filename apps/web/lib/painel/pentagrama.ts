import { JEITOS, type FormatoId } from "@modolume/core";

/**
 * Pentagrama de habilidades: os sete formatos de atividade agrupados nos
 * cinco jeitos de aprender usados no app do aluno (Visual, Mãos na massa,
 * Lógico, Simbólico e Espacial). Cada ponta é o acerto médio do aluno nos
 * formatos daquele jeito, ponderado pela quantidade de atividades.
 */

export const PONTAS = ["Visual", "Mãos na massa", "Lógico", "Simbólico", "Espacial"] as const;
export type Ponta = (typeof PONTAS)[number];

export interface ValorPonta {
  jeito: Ponta;
  aluno: number | null;
  turma: number | null;
  atividades: number;
  formatos: string[];
}

type Formato = { formato: FormatoId; rotulo: string; acertoMedio: number; amostra: number };

export function pentagrama(doAluno: Formato[], turmaPorFormato: Record<string, number>): ValorPonta[] {
  return PONTAS.map((jeito) => {
    const ids = (Object.keys(JEITOS) as FormatoId[]).filter((f) => JEITOS[f].jeito === jeito);
    const meus = doAluno.filter((f) => ids.includes(f.formato));
    const atividades = meus.reduce((s, f) => s + f.amostra, 0);
    const aluno = atividades ? meus.reduce((s, f) => s + f.acertoMedio * f.amostra, 0) / atividades : null;
    const daTurma = ids.map((f) => turmaPorFormato[f]).filter((v): v is number => v !== undefined);
    const turma = daTurma.length ? daTurma.reduce((s, v) => s + v, 0) / daTurma.length : null;
    return {
      jeito,
      aluno: aluno === null ? null : Math.round(aluno),
      turma: turma === null ? null : Math.round(turma),
      atividades,
      formatos: meus.map((f) => f.rotulo),
    };
  });
}
