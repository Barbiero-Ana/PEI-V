import { z } from "zod";
import { esquemaData } from "./validacao";
import { FORMATO_IDS, type FormatoId } from "./formato";

/**
 * Planejamento de aulas do professor (ADR 0010). Contrato comum ao painel e à
 * API: situações, unidades temáticas, habilidades da BNCC, o formato de um
 * plano e a validação (RN-22 e RN-23).
 */

export const SITUACOES_PLANO = ["rascunho", "planejada", "realizada"] as const;
export type SituacaoPlano = (typeof SITUACOES_PLANO)[number];

export const ROTULO_SITUACAO: Record<SituacaoPlano, string> = {
  rascunho: "Rascunho",
  planejada: "Planejada",
  realizada: "Realizada",
};

/** Unidades temáticas de Matemática na BNCC. */
export const UNIDADES_TEMATICAS = [
  "Números",
  "Álgebra",
  "Geometria",
  "Grandezas e medidas",
  "Probabilidade e estatística",
] as const;

/** Habilidades da BNCC do 6º ano ligadas aos conteúdos trabalhados no app (texto resumido). */
export const HABILIDADES_BNCC = [
  { codigo: "EF06MA01", resumo: "Comparar, ordenar, ler e escrever naturais e racionais na reta numérica" },
  { codigo: "EF06MA03", resumo: "Resolver e elaborar problemas com as operações com números naturais" },
  { codigo: "EF06MA05", resumo: "Classificar números em primos e compostos; múltiplos e divisores" },
  { codigo: "EF06MA07", resumo: "Compreender, comparar e ordenar frações; frações equivalentes" },
  { codigo: "EF06MA08", resumo: "Relacionar as formas fracionária e decimal dos racionais" },
  { codigo: "EF06MA13", resumo: "Resolver e elaborar problemas que envolvam porcentagens" },
  { codigo: "EF06MA24", resumo: "Resolver problemas com grandezas como comprimento, massa, tempo e área" },
  { codigo: "EF06MA27", resumo: "Determinar medidas da abertura de ângulos com transferidor" },
] as const;

export interface PlanoAula {
  id: string;
  professorId: string;
  turmaId: string;
  /** Data da aula, YYYY-MM-DD. */
  data: string;
  /** Horário de início, HH:MM (opcional). */
  horario: string;
  /** Quantidade de aulas (tempos) do plano. */
  aulas: number;
  tema: string;
  unidade: string;
  habilidades: string[];
  objetivos: string;
  conteudos: string;
  metodologia: string;
  formatos: FormatoId[];
  /** Atividades do app Modolume que serão aplicadas (ids das missões). */
  atividadesApp: string[];
  recursos: string;
  avaliacao: string;
  /** Alunos que terão acompanhamento mais próximo nesta aula. */
  alunosFoco: string[];
  observacoes: string;
  status: SituacaoPlano;
  /** Registro depois da aula: o que aconteceu e o que ajustar. */
  registro: string;
  atualizadoEm: string;
}

export type DadosPlano = Omit<PlanoAula, "id" | "professorId" | "atualizadoEm">;

const exemplo = (id: string, p: Partial<PlanoAula> & Pick<PlanoAula, "turmaId" | "data" | "tema">): PlanoAula => ({
  id,
  professorId: "prof-1",
  horario: "",
  aulas: 2,
  unidade: "Números",
  habilidades: [],
  objetivos: "",
  conteudos: "",
  metodologia: "",
  formatos: [],
  atividadesApp: [],
  recursos: "",
  avaliacao: "",
  alunosFoco: [],
  observacoes: "",
  status: "planejada",
  registro: "",
  atualizadoEm: "2026-10-20",
  ...p,
});

/** Planos de exemplo do professor de demonstração (dados iniciais do banco). */
export const PLANOS_EXEMPLO: PlanoAula[] = [
  exemplo("plano-1", {
    turmaId: "turma-6a",
    data: "2026-10-13",
    horario: "07:30",
    tema: "Frações equivalentes com material concreto",
    habilidades: ["EF06MA07"],
    objetivos: "Reconhecer frações equivalentes e justificar a equivalência com representações visuais.",
    conteudos: "Frações equivalentes; simplificação.",
    metodologia: "Discussão inicial com tiras de papel, atividade em duplas e fechamento no quadro.",
    formatos: ["associacao-visual", "montagem"],
    atividadesApp: ["partes-do-todo", "pizza-equivalente"],
    recursos: "Tiras de papel, app Modolume (mapa de frações).",
    avaliacao: "Observação das duplas e atividade de associação no app.",
    status: "realizada",
    registro: "A turma foi bem com as tiras. Dúvidas na simplificação: retomar na próxima aula.",
  }),
  exemplo("plano-2", {
    turmaId: "turma-6b",
    data: "2026-10-15",
    horario: "13:30",
    tema: "Números decimais na reta numérica",
    habilidades: ["EF06MA01", "EF06MA08"],
    objetivos: "Localizar e comparar decimais na reta numérica.",
    conteudos: "Décimos e centésimos; comparação de decimais.",
    metodologia: "Reta numérica no chão da sala e atividade de ordenação no app.",
    formatos: ["sequencia", "manipulacao"],
    recursos: "Fita crepe, cartões numerados, app Modolume.",
    avaliacao: "Atividade de ordenação no app.",
    status: "realizada",
    registro: "Boa participação. Alguns alunos ainda confundem 0,5 com 0,05.",
  }),
  exemplo("plano-3", {
    turmaId: "turma-6a",
    data: "2026-10-28",
    horario: "07:30",
    tema: "Porcentagem no dia a dia",
    habilidades: ["EF06MA13"],
    objetivos: "Calcular porcentagens simples (10%, 25%, 50%) em situações de compra.",
    conteudos: "Porcentagem como fração de 100; cálculo mental.",
    metodologia: "Panfletos de mercado, cálculo em grupos e correção coletiva.",
    formatos: ["manipulacao", "objetiva"],
    atividadesApp: ["promocao-da-loja", "mercadinho"],
    recursos: "Panfletos, calculadora, app Modolume (atividade do mercado).",
    avaliacao: "Lista curta com 5 situações e atividade objetiva no app.",
    alunosFoco: ["turma-6a-al9", "turma-6a-al7"],
  }),
  exemplo("plano-4", {
    turmaId: "turma-6b",
    data: "2026-10-29",
    horario: "13:30",
    tema: "Perímetro e área de retângulos",
    unidade: "Grandezas e medidas",
    habilidades: ["EF06MA24"],
    objetivos: "Diferenciar perímetro de área e calcular ambos em retângulos.",
    conteudos: "Perímetro; área por contagem de quadradinhos e por multiplicação.",
    metodologia: "Malha quadriculada, comparação de figuras com mesmo perímetro e áreas diferentes.",
    formatos: ["montagem", "exploracao-3d"],
    atividadesApp: ["cerca-da-horta"],
    recursos: "Malha quadriculada impressa, app Modolume.",
    avaliacao: "Produção na malha e atividade de montagem no app.",
    alunosFoco: ["turma-6b-al4", "turma-6b-al9"],
  }),
  exemplo("plano-5", {
    turmaId: "turma-6a",
    data: "2026-11-04",
    horario: "07:30",
    tema: "Ângulos com transferidor",
    unidade: "Geometria",
    habilidades: ["EF06MA27"],
    objetivos: "Medir ângulos com transferidor e classificá-los.",
    formatos: ["exploracao-3d", "objetiva"],
    recursos: "Transferidores, régua.",
  }),
  exemplo("plano-6", {
    turmaId: "turma-6b",
    data: "2026-11-05",
    tema: "Múltiplos e divisores",
    habilidades: ["EF06MA05"],
    objetivos: "Identificar múltiplos e divisores e reconhecer números primos.",
    formatos: ["completar", "sequencia"],
    status: "rascunho",
  }),
];

export const formatoValido = (f: string): f is FormatoId => (FORMATO_IDS as readonly string[]).includes(f);

const texto = z.string().trim();
/** Validação do plano no servidor (as mesmas regras do formulário do painel, RN-22). */
export const esquemaPlano = z
  .object({
    turmaId: texto.min(1, "Escolha a turma."),
    data: esquemaData,
    horario: texto.regex(/^([01]\d|2[0-3]):[0-5]\d$|^$/, "Horário no formato HH:MM."),
    aulas: z.number().int().min(1, "Entre 1 e 10 aulas.").max(10, "Entre 1 e 10 aulas."),
    tema: texto.min(1, "Dê um tema para a aula.").max(200),
    unidade: z.enum(UNIDADES_TEMATICAS),
    habilidades: z.array(texto).max(20),
    objetivos: texto.max(4000),
    conteudos: texto.max(4000),
    metodologia: texto.max(4000),
    formatos: z.array(z.enum(FORMATO_IDS)).max(FORMATO_IDS.length),
    atividadesApp: z.array(texto).max(40),
    recursos: texto.max(4000),
    avaliacao: texto.max(4000),
    alunosFoco: z.array(texto).max(60),
    observacoes: texto.max(4000),
    status: z.enum(SITUACOES_PLANO),
    registro: texto.max(4000),
  })
  .refine((p) => p.status === "rascunho" || p.objetivos.length > 0, {
    path: ["objetivos"],
    message: "Descreva os objetivos (só rascunhos podem ficar sem).",
  });
