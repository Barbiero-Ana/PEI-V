import { FORMATOS_ATIVIDADE } from "./formato";
import type { DadosModolume, Id } from "./entidade";

/**
 * Indicadores SMART do painel do professor: cada um é Específico (o que mede),
 * Mensurável (fórmula), Atingível (meta realista), Relevante (por que importa e
 * o que fazer) e Temporal (janela de 4 semanas, revista a cada 4 semanas).
 *
 * São referências para planejar, não diagnóstico do aluno. As metas e a janela
 * estão documentadas no PRD do painel do professor (RN-13).
 */

/** Janela de medição: as 4 semanas que terminam na atividade mais recente. */
export const JANELA_SMART_DIAS = 28;

export type IdIndicador = "IND-01" | "IND-02" | "IND-03" | "IND-04" | "IND-05" | "IND-06";
export type SituacaoMeta = "atingida" | "perto" | "abaixo" | "sem-dados";

export interface MetaSmart {
  valor: number;
  /** "minimo": quanto mais, melhor; "maximo": quanto menos, melhor. */
  sentido: "minimo" | "maximo";
  unidade: "%" | "tentativas";
  /** Distância da meta que ainda conta como "perto". */
  tolerancia: number;
}

export interface DefinicaoIndicador {
  id: IdIndicador;
  nome: string;
  especifico: string;
  mensuravel: string;
  atingivel: string;
  relevante: string;
  temporal: string;
  /** O que o professor pode fazer quando a meta não é atingida. */
  acao: string;
  meta: MetaSmart;
}

const TEMPORAL = "Medido nas últimas 4 semanas de atividades e comparado com as 4 semanas anteriores.";

export const INDICADORES_SMART: readonly DefinicaoIndicador[] = [
  {
    id: "IND-01",
    nome: "Acerto médio da turma",
    especifico: "Quanto a turma acerta nas atividades do Modolume.",
    mensuravel: "Média do percentual de acerto de todos os resultados da turma na janela.",
    atingivel: "70% é a referência de aprendizagem adequada usada nos planos de aula.",
    relevante: "Mostra se o conteúdo trabalhado está sendo compreendido pela turma.",
    temporal: TEMPORAL,
    acao: "Retomar o conteúdo no formato em que a turma acerta mais.",
    meta: { valor: 70, sentido: "minimo", unidade: "%", tolerancia: 5 },
  },
  {
    id: "IND-02",
    nome: "Alunos abaixo de 60% no período",
    especifico: "Parcela da turma com acerto médio abaixo de 60% nas últimas 4 semanas.",
    mensuravel: "Alunos com atividade e acerto médio abaixo de 60% ÷ alunos com atividade.",
    atingivel: "Até 15% da turma permite acompanhamento individual dentro da aula.",
    relevante: "Indica quem precisa de intervenção antes da próxima avaliação.",
    temporal: TEMPORAL,
    acao: "Marcar esses alunos no próximo plano de aula e propor atividade no formato em que vão melhor.",
    meta: { valor: 15, sentido: "maximo", unidade: "%", tolerancia: 5 },
  },
  {
    id: "IND-03",
    nome: "Formato com menor acerto",
    especifico: "O formato de atividade em que a turma acerta menos.",
    mensuravel: "Menor acerto médio entre os formatos com pelo menos 3 resultados na janela.",
    atingivel: "60% evita que um único formato fique muito abaixo dos demais.",
    relevante: "Aponta o tipo de atividade que precisa de mais mediação ou de outra abordagem.",
    temporal: TEMPORAL,
    acao: "Planejar uma aula que trabalhe esse formato com apoio, ou o mesmo conteúdo em outro formato.",
    meta: { valor: 60, sentido: "minimo", unidade: "%", tolerancia: 5 },
  },
  {
    id: "IND-04",
    nome: "Conclusão das atividades",
    especifico: "Quanto das atividades os alunos chegam a terminar.",
    mensuravel: "Média do percentual de conclusão dos resultados da turma na janela.",
    atingivel: "85% considera faltas e atividades interrompidas.",
    relevante: "Conclusão baixa pode indicar atividade longa, difícil ou pouco tempo em aula.",
    temporal: TEMPORAL,
    acao: "Rever o tamanho das atividades ou reservar tempo de aula para terminá-las.",
    meta: { valor: 85, sentido: "minimo", unidade: "%", tolerancia: 5 },
  },
  {
    id: "IND-05",
    nome: "Participação",
    especifico: "Parcela dos alunos da turma que fez ao menos uma atividade.",
    mensuravel: "Alunos com pelo menos 1 resultado na janela ÷ alunos da turma.",
    atingivel: "90% considera faltas e alunos sem aparelho em algum período.",
    relevante: "Sem participação, os outros indicadores não representam a turma.",
    temporal: TEMPORAL,
    acao: "Conversar com os alunos sem atividade e verificar acesso ao aparelho.",
    meta: { valor: 90, sentido: "minimo", unidade: "%", tolerancia: 5 },
  },
  {
    id: "IND-06",
    nome: "Tentativas por atividade",
    especifico: "Quantas tentativas, em média, os alunos precisam para concluir.",
    mensuravel: "Média do número de tentativas dos resultados da turma na janela.",
    atingivel: "Até 1,8 tentativa indica que a maioria resolve na primeira ou na segunda vez.",
    relevante: "Muitas tentativas sugerem que a turma está chutando ou travando no enunciado.",
    temporal: TEMPORAL,
    acao: "Ler o enunciado com a turma e mostrar um exemplo antes da atividade.",
    meta: { valor: 1.8, sentido: "maximo", unidade: "tentativas", tolerancia: 0.3 },
  },
];

export interface IndicadorSmart extends DefinicaoIndicador {
  /** Valor na janela atual; null quando não há dados suficientes. */
  valor: number | null;
  /** Valor nas 4 semanas anteriores, para comparação. */
  anterior: number | null;
  status: SituacaoMeta;
  /** Complemento do valor, como o nome do formato no IND-03. */
  detalhe?: string;
  /** Resultados que sustentam o número. */
  amostra: number;
}

export interface JanelaSmart {
  inicio: string;
  fim: string;
}

export interface PainelSmart {
  janela: JanelaSmart;
  anterior: JanelaSmart;
  /** Data da próxima revisão: 4 semanas depois do fim da janela. */
  proximaRevisao: string;
  indicadores: IndicadorSmart[];
  atingidas: number;
}

const media = (ns: number[]) => (ns.length === 0 ? 0 : ns.reduce((s, n) => s + n, 0) / ns.length);
const arredonda = (n: number, casas = 0) => Math.round(n * 10 ** casas) / 10 ** casas;

/** Soma dias a uma data ISO (AAAA-MM-DD), sem depender do fuso. */
export function somarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Situação do valor em relação à meta. */
export function situacaoDaMeta(valor: number | null, meta: MetaSmart): SituacaoMeta {
  if (valor === null) return "sem-dados";
  const folga = meta.sentido === "minimo" ? valor - meta.valor : meta.valor - valor;
  if (folga >= 0) return "atingida";
  return -folga <= meta.tolerancia ? "perto" : "abaixo";
}

type Linha = { alunoId: Id; formato: string; acerto: number; conclusao: number; tentativas: number };

function linhasDaJanela(data: DadosModolume, janela: JanelaSmart, turmaId?: Id): Linha[] {
  const aplicacoes = new Map(
    data.aplicacoes
      .filter((a) => (!turmaId || a.turmaId === turmaId) && a.data >= janela.inicio && a.data <= janela.fim)
      .map((a) => [a.id, a]),
  );
  const atividades = new Map(data.atividades.map((a) => [a.id, a]));
  return data.resultados.flatMap((r) => {
    const ap = aplicacoes.get(r.aplicacaoId);
    const at = ap ? atividades.get(ap.atividadeId) : undefined;
    if (!at) return [];
    return [
      {
        alunoId: r.alunoId,
        formato: at.formato,
        acerto: r.percentualAcerto,
        conclusao: r.percentualConclusao,
        tentativas: r.tentativas,
      },
    ];
  });
}

/** Mínimo de resultados para um formato entrar no IND-03. */
const AMOSTRA_MINIMA_FORMATO = 3;

function calcular(linhas: Linha[], totalAlunos: number) {
  if (linhas.length === 0) return null;
  const porAluno = new Map<Id, number[]>();
  for (const l of linhas) porAluno.set(l.alunoId, [...(porAluno.get(l.alunoId) ?? []), l.acerto]);
  const abaixo = [...porAluno.values()].filter((acertos) => media(acertos) < 60).length;
  const textoAbaixo = `${abaixo} de ${porAluno.size} ${porAluno.size === 1 ? "aluno" : "alunos"}`;

  let pior: { rotulo: string; acerto: number } | null = null;
  for (const f of FORMATOS_ATIVIDADE) {
    const doFormato = linhas.filter((l) => l.formato === f.id);
    if (doFormato.length < AMOSTRA_MINIMA_FORMATO) continue;
    const acerto = media(doFormato.map((l) => l.acerto));
    if (!pior || acerto < pior.acerto) pior = { rotulo: f.rotulo, acerto };
  }

  return {
    "IND-01": arredonda(media(linhas.map((l) => l.acerto))),
    "IND-02": arredonda((abaixo / porAluno.size) * 100),
    "IND-03": pior ? arredonda(pior.acerto) : null,
    "IND-04": arredonda(media(linhas.map((l) => l.conclusao))),
    "IND-05": totalAlunos > 0 ? arredonda((porAluno.size / totalAlunos) * 100) : null,
    "IND-06": arredonda(media(linhas.map((l) => l.tentativas)), 1),
    piorFormato: pior?.rotulo,
    textoAbaixo,
  } satisfies Record<IdIndicador, number | null> & { piorFormato?: string; textoAbaixo: string };
}

/**
 * Indicadores SMART de uma turma (ou de todas as turmas dos dados, sem filtro).
 * A janela termina na atividade mais recente, ou em `referencia`, se informada.
 */
export function indicadoresSmart(data: DadosModolume, filtro: { turmaId?: Id; referencia?: string } = {}): PainelSmart {
  const { turmaId } = filtro;
  const datas = data.aplicacoes.filter((a) => !turmaId || a.turmaId === turmaId).map((a) => a.data);
  const fim = filtro.referencia ?? datas.sort().at(-1) ?? new Date().toISOString().slice(0, 10);
  const janela = { inicio: somarDias(fim, -(JANELA_SMART_DIAS - 1)), fim };
  const anterior = { inicio: somarDias(janela.inicio, -JANELA_SMART_DIAS), fim: somarDias(janela.inicio, -1) };
  const totalAlunos = data.alunos.filter((a) => !turmaId || a.turmaId === turmaId).length;

  const linhas = linhasDaJanela(data, janela, turmaId);
  const atual = calcular(linhas, totalAlunos);
  const antes = calcular(linhasDaJanela(data, anterior, turmaId), totalAlunos);
  const amostra = linhas.length;

  const indicadores = INDICADORES_SMART.map((def): IndicadorSmart => {
    const valor = atual?.[def.id] ?? null;
    return {
      ...def,
      valor,
      anterior: antes?.[def.id] ?? null,
      status: situacaoDaMeta(valor, def.meta),
      detalhe: def.id === "IND-03" ? atual?.piorFormato : def.id === "IND-02" ? atual?.textoAbaixo : undefined,
      amostra,
    };
  });

  return {
    janela,
    anterior,
    proximaRevisao: somarDias(fim, JANELA_SMART_DIAS),
    indicadores,
    atingidas: indicadores.filter((i) => i.status === "atingida").length,
  };
}
