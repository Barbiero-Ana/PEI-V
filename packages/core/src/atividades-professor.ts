import { z } from "zod";
import { esquemaData } from "./validacao";
import { MISSOES } from "./missoes";

/**
 * Atividades montadas pelo professor no painel e enviadas para o app do aluno.
 * Este é o contrato entre painel, API e app: os três validam e leem as questões
 * com as mesmas definições.
 *
 * O professor monta questões em quatro formatos (objetiva, completar,
 * associação e sequência) ou escolhe uma atividade pronta do app (montagem,
 * manipulação e 3D precisam do jogo do app). Ao enviar, a atividade fica
 * liberada para as turmas na data escolhida; as respostas voltam como jogadas
 * e entram no desempenho e nos insights.
 */

export const FORMATOS_EDITAVEIS = ["objetiva", "completar", "associacao-visual", "sequencia", "pronta"] as const;
export type FormatoEditavel = (typeof FORMATOS_EDITAVEIS)[number];

export const SOBRE_FORMATOS: Record<FormatoEditavel, { nome: string; descricao: string; exemplo: string }> = {
  objetiva: {
    nome: "Questão objetiva",
    descricao: "Enunciado e alternativas; o aluno escolhe uma.",
    exemplo: "Quanto é 25% de 80?  a) 20  b) 25  c) 40  d) 60",
  },
  completar: {
    nome: "Completar lacunas",
    descricao: "Frase ou conta com espaços; a resposta fica entre colchetes.",
    exemplo: "Metade de 1/2 é [1/4].",
  },
  "associacao-visual": {
    nome: "Associação",
    descricao: "Pares para ligar: figura, número ou expressão de um lado, conceito do outro.",
    exemplo: "0,5  ↔  1/2",
  },
  sequencia: {
    nome: "Sequência",
    descricao: "Itens na ordem certa; o app embaralha e o aluno reordena.",
    exemplo: "0,1 · 0,25 · 0,5 · 0,75",
  },
  pronta: {
    nome: "Atividade pronta do app",
    descricao: "Uma das atividades interativas do app (montar, manipular, 3D…).",
    exemplo: "Cerca da horta, Promoção da loja…",
  },
};

const texto = z.string().trim();
/** Comando próprio de cada questão ("Ligue as frações aos decimais"); vazio usa a instrução geral. */
const comando = z.string().trim().max(200).default("");
export const LIMITE_FEEDBACK_QUESTAO = 300;
const feedbackErro = texto.max(LIMITE_FEEDBACK_QUESTAO, "Use até 300 caracteres no feedback.").optional();
export const esquemaQuestao = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("objetiva"),
    enunciado: texto.min(3, "Escreva o enunciado."),
    alternativas: z.array(texto.min(1, "Preencha todas as alternativas.")).min(2).max(5),
    correta: z.number().int().min(0),
    feedbackErro,
  }),
  z.object({
    tipo: z.literal("completar"),
    comando,
    texto: texto.regex(/\[[^\]]+\]/, "Marque ao menos uma resposta entre colchetes, como [1/4]."),
    feedbackErro,
  }),
  z.object({
    tipo: z.literal("associacao-visual"),
    comando,
    pares: z
      .array(z.object({ a: texto.min(1, "Preencha os dois lados."), b: texto.min(1, "Preencha os dois lados.") }))
      .min(2, "Use pelo menos dois pares."),
    feedbackErro,
  }),
  z.object({
    tipo: z.literal("sequencia"),
    comando,
    itens: z.array(texto.min(1, "Preencha todos os itens.")).min(3, "Use pelo menos três itens."),
    feedbackErro,
  }),
]);
export type Questao = z.infer<typeof esquemaQuestao>;

export const esquemaAtividade = z
  .object({
    titulo: texto.min(3, "Dê um título à atividade."),
    formato: z.enum(FORMATOS_EDITAVEIS),
    instrucao: texto,
    habilidade: texto,
    missaoId: texto,
    questoes: z.array(esquemaQuestao).max(200, "Use até 200 questões por atividade."),
    turmas: z.array(z.string()).min(1, "Escolha ao menos uma turma."),
    liberarEm: esquemaData,
    prazo: z.union([esquemaData, z.literal("")]).optional(),
    planoId: texto,
  })
  .superRefine((a, ctx) => {
    if (a.prazo && a.prazo < a.liberarEm)
      ctx.addIssue({ code: "custom", path: ["prazo"], message: "O prazo precisa ser igual ou posterior à liberação." });
    if (a.formato === "pronta" && !MISSOES.some((m) => m.id === a.missaoId))
      ctx.addIssue({ code: "custom", path: ["missaoId"], message: "Escolha a atividade do app." });
    if (a.formato !== "pronta" && a.questoes.length === 0)
      ctx.addIssue({ code: "custom", path: ["questoes"], message: "Adicione ao menos uma questão." });
    a.questoes.forEach((q, i) => {
      if (q.tipo !== a.formato)
        ctx.addIssue({ code: "custom", path: ["questoes", i], message: "Questão de outro formato." });
      if (q.tipo === "objetiva" && q.correta >= q.alternativas.length)
        ctx.addIssue({ code: "custom", path: ["questoes", i], message: "Marque a alternativa correta." });
    });
  });
export type DadosAtividade = z.infer<typeof esquemaAtividade>;

/** Conteúdo pedagógico canônico: mudar o prazo não substitui a publicação. */
export function conteudoDaPublicacao(entrada: DadosAtividade) {
  const d = esquemaAtividade.parse(entrada);
  return JSON.stringify({
    titulo: d.titulo,
    formato: d.formato,
    instrucao: d.instrucao,
    habilidade: d.habilidade,
    missaoId: d.missaoId,
    planoId: d.planoId,
    liberarEm: d.liberarEm,
    turmas: [...d.turmas].sort(),
    questoes: d.questoes,
  });
}

export const esquemaAtividadeParaEnvio = esquemaAtividade.superRefine((a, ctx) => {
  for (const [i, q] of a.questoes.entries()) {
    if (!q.feedbackErro) {
      ctx.addIssue({
        code: "custom",
        path: ["questoes", i, "feedbackErro"],
        message: "Escreva uma orientação para quando o aluno errar esta questão.",
      });
    }
  }
});

export interface AtividadeProfessor extends DadosAtividade {
  publicacaoId?: string;
  publicacaoNumero?: number;
  id: string;
  professorId: string;
  status: "rascunho" | "enviada";
  enviadaEm: string;
  atualizadaEm: string;
}

/** Atividades de exemplo do professor de demonstração (dados iniciais do banco). */
export const ATIVIDADES_EXEMPLO: AtividadeProfessor[] = [
  {
    id: "atv-1",
    professorId: "prof-1",
    titulo: "Porcentagem no mercado",
    formato: "objetiva",
    instrucao: "Leia cada situação e escolha a resposta certa.",
    habilidade: "EF06MA13",
    missaoId: "",
    questoes: [
      {
        tipo: "objetiva",
        enunciado: "Uma camiseta custa R$ 80 e está com 25% de desconto. Quanto é o desconto?",
        alternativas: ["R$ 20", "R$ 25", "R$ 40", "R$ 60"],
        correta: 0,
        feedbackErro: "25% é um quarto do preço. Divida R$ 80 em quatro partes iguais para achar o desconto.",
      },
      {
        tipo: "objetiva",
        enunciado: "Quanto é 10% de 150?",
        alternativas: ["R$ 1,50", "R$ 10", "R$ 15", "R$ 50"],
        correta: 2,
        feedbackErro: "10% é uma parte de dez. Divida 150 por 10.",
      },
      {
        tipo: "objetiva",
        enunciado: "50% de 36 é igual a:",
        alternativas: ["12", "18", "24", "72"],
        correta: 1,
        feedbackErro: "50% significa metade. Separe 36 em dois grupos do mesmo tamanho.",
      },
    ],
    turmas: ["turma-6a"],
    liberarEm: "2026-10-28",
    planoId: "plano-3",
    status: "enviada",
    enviadaEm: "2026-10-26",
    atualizadaEm: "2026-10-26",
  },
  {
    id: "atv-2",
    professorId: "prof-1",
    titulo: "Frações e decimais: ligue os pares",
    formato: "associacao-visual",
    instrucao: "Ligue cada fração ao número decimal igual a ela.",
    habilidade: "EF06MA08",
    missaoId: "",
    questoes: [
      {
        tipo: "associacao-visual",
        comando: "Ligue cada fração ao decimal igual a ela.",
        feedbackErro: "Divida o número de cima pelo de baixo e procure o resultado na coluna da direita.",
        pares: [
          { a: "1/2", b: "0,5" },
          { a: "1/4", b: "0,25" },
          { a: "3/4", b: "0,75" },
          { a: "1/10", b: "0,1" },
        ],
      },
    ],
    turmas: ["turma-6a", "turma-6b"],
    liberarEm: "2026-11-04",
    planoId: "",
    status: "rascunho",
    enviadaEm: "",
    atualizadaEm: "2026-10-27",
  },
];

/** Atividade pronta do app escolhida (ou null). */
export const missaoDa = (a: Pick<DadosAtividade, "missaoId">) => MISSOES.find((m) => m.id === a.missaoId) ?? null;

/** Respostas de uma questão de completar ("25% de 80 é [20]" → ["20"]). */
export const respostasDeCompletar = (texto: string) => [...texto.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]!.trim());
