import type { Prisma } from "@prisma/client";
import type { AtividadeProfessor, PlanoAula, Questao } from "@modolume/core";

/**
 * Conversão entre as tabelas do banco e os formatos do núcleo (os mesmos que o
 * painel e o app usam). O banco guarda tudo em tabelas relacionais (questões e
 * opções, vínculos com turmas, itens do plano); para fora, a API devolve o
 * formato de sempre, então painel e app não precisam saber como está guardado.
 */

/** "2026-11-04" → data do banco (coluna DATE, sem fuso). */
export const dataDoBanco = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** Data do banco → "2026-11-04". */
export const dataIso = (d: Date) => d.toISOString().slice(0, 10);

type TipoBanco = "objetiva" | "completar" | "associacao_visual" | "sequencia";
const paraTipoBanco = (t: Questao["tipo"]): TipoBanco => (t === "associacao-visual" ? "associacao_visual" : t);

/** Questões do núcleo → linhas de questao_atividade e opcao_questao. */
export function questoesParaBanco(questoes: Questao[]): Prisma.QuestaoAtividadeCreateWithoutAtividadeInput[] {
  return questoes.map((q, ordem) => {
    const base = { ordem, tipo: paraTipoBanco(q.tipo) };
    switch (q.tipo) {
      case "objetiva":
        return {
          ...base,
          enunciado: q.enunciado,
          opcoes: { create: q.alternativas.map((texto, i) => ({ ordem: i, texto, correta: i === q.correta })) },
        };
      case "completar":
        return { ...base, comando: q.comando ?? "", texto: q.texto };
      case "associacao-visual":
        return {
          ...base,
          comando: q.comando ?? "",
          opcoes: { create: q.pares.map((p, i) => ({ ordem: i, texto: p.a, par: p.b })) },
        };
      case "sequencia":
        return {
          ...base,
          comando: q.comando ?? "",
          opcoes: { create: q.itens.map((texto, i) => ({ ordem: i, texto })) },
        };
    }
  });
}

export const incluirAtividade = {
  turmas: { select: { turmaId: true } },
  questoes: { orderBy: { ordem: "asc" }, include: { opcoes: { orderBy: { ordem: "asc" } } } },
} satisfies Prisma.AtividadeProfessorInclude;
type AtividadeDoBanco = Prisma.AtividadeProfessorGetPayload<{ include: typeof incluirAtividade }>;

/** Linhas de questão e opções → questões do núcleo. */
export function questoesDoBanco(linhas: AtividadeDoBanco["questoes"]): Questao[] {
  return linhas.map((q) => {
    switch (q.tipo) {
      case "objetiva":
        return {
          tipo: "objetiva",
          enunciado: q.enunciado ?? "",
          alternativas: q.opcoes.map((o) => o.texto),
          correta: Math.max(
            0,
            q.opcoes.findIndex((o) => o.correta),
          ),
        };
      case "completar":
        return { tipo: "completar", comando: q.comando, texto: q.texto ?? "" };
      case "associacao_visual":
        return {
          tipo: "associacao-visual",
          comando: q.comando,
          pares: q.opcoes.map((o) => ({ a: o.texto, b: o.par ?? "" })),
        };
      case "sequencia":
        return { tipo: "sequencia", comando: q.comando, itens: q.opcoes.map((o) => o.texto) };
    }
  });
}

/** Atividade do banco → formato do núcleo (o que painel e app recebem). */
export function atividadeDoBanco(a: AtividadeDoBanco): AtividadeProfessor {
  return {
    id: a.id,
    professorId: a.professorId,
    titulo: a.titulo,
    formato: a.formato as AtividadeProfessor["formato"],
    instrucao: a.instrucao,
    habilidade: a.habilidadeCodigo ?? "",
    missaoId: a.missaoId ?? "",
    questoes: questoesDoBanco(a.questoes),
    turmas: a.turmas.map((t) => t.turmaId),
    liberarEm: dataIso(a.liberarEm),
    planoId: a.planoId ?? "",
    status: a.status,
    enviadaEm: a.enviadaEm ? dataIso(a.enviadaEm) : "",
    atualizadaEm: dataIso(a.atualizadoEm),
  };
}

export const incluirPlano = {
  habilidades: { select: { habilidadeCodigo: true } },
  formatos: { select: { formatoId: true } },
  missoes: { select: { missaoId: true } },
  alunosFoco: { select: { alunoId: true } },
} satisfies Prisma.PlanoAulaInclude;
type PlanoDoBanco = Prisma.PlanoAulaGetPayload<{ include: typeof incluirPlano }>;

/** Plano do banco (com as tabelas filhas) → formato do núcleo. */
export function planoDoBanco(p: PlanoDoBanco): PlanoAula {
  return {
    id: p.id,
    professorId: p.professorId,
    turmaId: p.turmaId,
    data: dataIso(p.data),
    horario: p.horario,
    aulas: p.aulas,
    tema: p.tema,
    unidade: p.unidadeNome,
    habilidades: p.habilidades.map((h) => h.habilidadeCodigo),
    objetivos: p.objetivos,
    conteudos: p.conteudos,
    metodologia: p.metodologia,
    formatos: p.formatos.map((f) => f.formatoId) as PlanoAula["formatos"],
    atividadesApp: p.missoes.map((m) => m.missaoId),
    recursos: p.recursos,
    avaliacao: p.avaliacao,
    alunosFoco: p.alunosFoco.map((a) => a.alunoId),
    observacoes: p.observacoes,
    status: p.status,
    registro: p.registro,
    atualizadoEm: dataIso(p.atualizadoEm),
  };
}
