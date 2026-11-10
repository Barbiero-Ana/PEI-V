import type { FormatoId } from "./formato";

/** Identificador opaco (UUID em produção via Supabase). */
export type Id = string;

/** Data no formato ISO `YYYY-MM-DD`. */
export type DataISO = string;

export interface Instituicao {
  id: Id;
  nome: string;
  contato?: string;
}

export interface Professor {
  id: Id;
  instituicaoId: Id;
  nome: string;
  email: string;
  disciplina: string;
}

export interface Turma {
  id: Id;
  professorId: Id;
  nome: string;
  serie: string;
  periodo: "manhã" | "tarde" | "integral";
}

export interface Aluno {
  id: Id;
  turmaId: Id;
  nome: string;
  /** Matrícula ou código interno da escola. */
  codigo: string;
}

/**
 * Conteúdo da atividade. Estrutura livre por design: cada formato define seus
 * próprios campos. Guardado como JSON no banco — novos formatos não exigem
 * alteração de schema.
 */
export type ConteudoAtividade = Record<string, unknown>;

export interface Atividade {
  id: Id;
  professorId: Id;
  titulo: string;
  disciplina: string;
  formato: FormatoId;
  /** Objetivo pedagógico que a atividade endereça. */
  objetivo: string;
  conteudo: ConteudoAtividade;
  criadaEm: DataISO;
}

export interface Aplicacao {
  id: Id;
  atividadeId: Id;
  turmaId: Id;
  data: DataISO;
}

export interface Resultado {
  id: Id;
  aplicacaoId: Id;
  alunoId: Id;
  /** Número de tentativas até concluir (ou desistir). */
  tentativas: number;
  /** Percentual de conclusão da atividade, 0–100. */
  percentualConclusao: number;
  /** Percentual de acertos sobre o que foi respondido, 0–100. */
  percentualAcerto: number;
  /** Tempo gasto em segundos. */
  tempoSegundos: number;
}

export type SituacaoObjetivo = "não iniciado" | "em andamento" | "alcançado";

export interface ObjetivoPedagogico {
  id: Id;
  professorId: Id;
  /** Objetivo geral do professor ou vinculado a uma turma. */
  turmaId?: Id;
  descricao: string;
  meta: string;
  status: SituacaoObjetivo;
  /** Progresso 0–100 para o feedback visual da gamificação leve. */
  progresso: number;
}

/** Snapshot completo do domínio — o que um `ProvedorDados` devolve. */
export interface DadosModolume {
  instituicoes: Instituicao[];
  professores: Professor[];
  turmas: Turma[];
  alunos: Aluno[];
  atividades: Atividade[];
  aplicacoes: Aplicacao[];
  resultados: Resultado[];
  objetivos: ObjetivoPedagogico[];
}
