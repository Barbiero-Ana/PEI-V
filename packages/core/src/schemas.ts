import { z } from "zod";
import { FORMATO_IDS, type FormatoId } from "./formats";

/** Validações de formulário compartilhadas entre web e app. */

export const formatoIdSchema: z.ZodType<FormatoId> = z.enum(FORMATO_IDS as unknown as [FormatoId, ...FormatoId[]]);

export const novaTurmaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da turma."),
  serie: z.string().min(1, "Informe a série."),
  periodo: z.enum(["manhã", "tarde", "integral"]),
});
export type NovaTurma = z.infer<typeof novaTurmaSchema>;

export const novoAlunoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do aluno."),
  codigo: z.string().min(1, "Informe a matrícula."),
  turmaId: z.string().min(1, "Selecione a turma."),
});
export type NovoAluno = z.infer<typeof novoAlunoSchema>;

export const novaAtividadeSchema = z.object({
  titulo: z.string().min(3, "Dê um título à atividade."),
  disciplina: z.string().min(2, "Informe a disciplina."),
  formato: formatoIdSchema,
  objetivo: z.string().min(5, "Descreva o objetivo pedagógico."),
});
export type NovaAtividade = z.infer<typeof novaAtividadeSchema>;

/** Uma linha da planilha de importação de resultados. */
export const linhaResultadoSchema = z.object({
  codigoAluno: z.string().min(1),
  tentativas: z.coerce.number().int().min(1).max(20),
  percentualConclusao: z.coerce.number().min(0).max(100),
  percentualAcerto: z.coerce.number().min(0).max(100),
  tempoSegundos: z.coerce.number().int().min(0),
});
export type LinhaResultado = z.infer<typeof linhaResultadoSchema>;

export const novoObjetivoSchema = z.object({
  descricao: z.string().min(5, "Descreva o objetivo."),
  meta: z.string().min(3, "Defina uma meta mensurável."),
  turmaId: z.string().optional(),
});
export type NovoObjetivo = z.infer<typeof novoObjetivoSchema>;
