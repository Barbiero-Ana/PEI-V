import { z } from "zod";
import { FORMATO_IDS, esquemaData } from "@modolume/core";

const inteiro = (maximo: number) => z.number().int().min(0).max(maximo);
export const esquemaJogada = z
  .object({
    fases: z
      .array(
        z.object({
          ordem: z.number().int().min(1).max(200),
          tentativas: z.number().int().min(1).max(2000),
          tempoSegundos: inteiro(86400),
          dica: z.boolean(),
        }),
      )
      .max(200)
      .optional(),
    id: z.string().min(8).max(80),
    origem: z.enum(["mapa", "professor"]),
    missaoId: z.string().min(1).max(60),
    atividadeId: z.string().max(40).nullish(),
    titulo: z.string().min(1).max(160),
    formato: z.enum(FORMATO_IDS),
    rodadas: z.number().int().min(1).max(200),
    acertosDePrimeira: inteiro(200),
    tentativas: inteiro(2000),
    percentualConclusao: inteiro(100),
    percentualAcerto: inteiro(100),
    tempoSegundos: inteiro(86_400),
    estrelas: z.number().int().min(1).max(3),
    dicas: inteiro(500).default(0),
    data: esquemaData,
  })
  .superRefine((jogada, contexto) => {
    if (
      jogada.fases &&
      (jogada.fases.length !== jogada.rodadas ||
        jogada.fases.some((f, i) => f.ordem !== i + 1) ||
        jogada.fases.reduce((s, f) => s + f.tentativas, 0) !== jogada.tentativas ||
        jogada.fases.filter((f) => f.tentativas === 1).length !== jogada.acertosDePrimeira ||
        jogada.fases.reduce((s, f) => s + f.tempoSegundos, 0) > jogada.tempoSegundos ||
        jogada.fases.filter((f) => f.dica).length !== jogada.dicas)
    )
      contexto.addIssue({
        code: "custom",
        path: ["fases"],
        message: "Detalhes das fases incompatíveis com o resultado.",
      });
    const acerto = Math.round((jogada.acertosDePrimeira / jogada.rodadas) * 100);
    const estrelas = acerto >= 90 ? 3 : acerto >= 60 ? 2 : 1;
    if (jogada.acertosDePrimeira > jogada.rodadas || jogada.tentativas < 2 * jogada.rodadas - jogada.acertosDePrimeira)
      contexto.addIssue({
        code: "custom",
        path: ["tentativas"],
        message: "Tentativas e acertos incompatíveis com as fases.",
      });
    if (jogada.percentualAcerto !== acerto || jogada.estrelas !== estrelas || jogada.percentualConclusao !== 100)
      contexto.addIssue({
        code: "custom",
        path: ["percentualAcerto"],
        message: "Resultado incompatível com as fases concluídas.",
      });
    if ((jogada.origem === "professor") !== Boolean(jogada.atividadeId))
      contexto.addIssue({
        code: "custom",
        path: ["atividadeId"],
        message: "Informe a atividade apenas para resultados do professor.",
      });
  });

export type JogadaRecebida = z.infer<typeof esquemaJogada>;

/** Não converte vínculo inválido em resultado avulso. Atividades recolhidas continuam
 * aceitas para sincronização offline, desde que a turma e o conteúdo ainda coincidam. */
export function referenciaDaJogadaValida(
  jogada: JogadaRecebida,
  missao: { formatoId: string } | undefined,
  atividade: { formato: string; missaoId: string | null } | undefined,
): boolean {
  if (jogada.origem === "mapa") return Boolean(missao && missao.formatoId === jogada.formato);
  if (!atividade) return false;
  return atividade.formato === "pronta"
    ? atividade.missaoId === jogada.missaoId && missao?.formatoId === jogada.formato
    : atividade.formato === jogada.formato && jogada.missaoId === jogada.atividadeId;
}
