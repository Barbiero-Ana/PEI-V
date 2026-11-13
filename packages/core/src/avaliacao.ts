import { z } from "zod";

export const PERCEPCOES_HABILIDADE = ["consolidada", "em desenvolvimento", "precisa de apoio"] as const;
export const esquemaAvaliacao = z
  .object({
    id: z.string().uuid(),
    jogadaId: z.string().min(8).max(80),
    feedback: z.string().trim().max(2000),
    percepcao: z.enum(PERCEPCOES_HABILIDADE).nullable().default(null),
    publicar: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.publicar && !v.feedback)
      ctx.addIssue({
        code: "custom",
        path: ["feedback"],
        message: "Escreva uma orientação antes de publicar a avaliação.",
      });
  });
export interface AvisoAluno {
  id: string;
  titulo: string;
  texto: string;
  tipo: "atividade" | "prazo" | "avaliacao";
  atividadeId: string | null;
  avaliacaoId?: string;
  data: string;
  lida: boolean;
}
