import { z } from "zod";
import { FORMATO_IDS, type FormatoId } from "./formato";

/** Validações de formulário compartilhadas entre web e app. */

export const esquemaFormato: z.ZodType<FormatoId> = z.enum(FORMATO_IDS as unknown as [FormatoId, ...FormatoId[]]);

export const esquemaNovaTurma = z.object({
  nome: z.string().min(2, "Informe o nome da turma."),
  serie: z.string().min(1, "Informe a série."),
  periodo: z.enum(["manhã", "tarde", "integral"]),
});
export type NovaTurma = z.infer<typeof esquemaNovaTurma>;

export const esquemaNovoAluno = z.object({
  nome: z.string().min(2, "Informe o nome do aluno."),
  codigo: z.string().min(1, "Informe a matrícula."),
  turmaId: z.string().min(1, "Selecione a turma."),
});
export type NovoAluno = z.infer<typeof esquemaNovoAluno>;

export const esquemaNovaAtividade = z.object({
  titulo: z.string().min(3, "Dê um título à atividade."),
  disciplina: z.string().min(2, "Informe a disciplina."),
  formato: esquemaFormato,
  objetivo: z.string().min(5, "Descreva o objetivo pedagógico."),
});
export type NovaAtividade = z.infer<typeof esquemaNovaAtividade>;

/** Uma linha da planilha de importação de resultados. */
export const esquemaLinhaResultado = z.object({
  codigoAluno: z.string().min(1),
  tentativas: z.coerce.number().int().min(1).max(20),
  percentualConclusao: z.coerce.number().min(0).max(100),
  percentualAcerto: z.coerce.number().min(0).max(100),
  tempoSegundos: z.coerce.number().int().min(0),
});
export type LinhaResultado = z.infer<typeof esquemaLinhaResultado>;

export const esquemaNovoObjetivo = z.object({
  descricao: z.string().min(5, "Descreva o objetivo."),
  meta: z.string().min(3, "Defina uma meta mensurável."),
  turmaId: z.string().optional(),
});
export type NovoObjetivo = z.infer<typeof esquemaNovoObjetivo>;
