import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ProvedorDadosDemonstracao,
  jogadasDeAprendizagem,
  analisarAprendizagem,
  desempenhoPorAluno,
  evolucaoMensal,
  desempenhoPorFormato,
  indicadoresSmart,
  perfilDoAluno,
  resumoGeral,
  type DadosModolume,
  type ProvedorDados,
  type FormatoId,
  type Professor,
} from "@modolume/core";
import { ErroApi, chamarApi, usandoApi } from "./api";
import { pentagrama } from "./pentagrama";
import { COOKIE_SESSAO, lerSessao } from "./sessao";

/**
 * Acesso a dados do painel. Com a API configurada (API_URL), os dados vêm do
 * banco: turmas, alunos com o avatar do app e as jogadas feitas no app. Sem
 * ela, vêm do provider de demonstração do núcleo. Nos dois casos, o painel
 * recebe o mesmo formato (DadosModolume) e calcula os indicadores com o núcleo:
 * as telas não mudam.
 */

let provider: ProvedorDados | null = null;
const demonstracao = () => (provider ??= new ProvedorDadosDemonstracao());

/** Resposta de GET /professor/dados. */
interface DadosDaApi {
  instituicao: { id: string; nome: string };
  professor: Professor;
  turmas: { id: string; professorId: string; nome: string; serie: string; periodo: string; codigo: string }[];
  alunos: {
    id: string;
    turmaId: string;
    nome: string;
    codigo: string;
    avatarSvg: string | null;
    codigoAcesso: string;
    pinCriado: boolean;
    bloqueadoAte: string | null;
  }[];
  jogadas: {
    id: string;
    alunoId: string;
    missaoId: string;
    titulo: string;
    formato: FormatoId;
    rodadas: number;
    acertosDePrimeira: number;
    dicas: number;
    estrelas: 1 | 2 | 3;
    tentativas: number;
    percentualConclusao: number;
    percentualAcerto: number;
    tempoSegundos: number;
    data: string;
  }[];
}

/**
 * Converte as jogadas do app no formato que o núcleo usa para os indicadores:
 * cada missão vira uma atividade, cada missão jogada por uma turma num dia vira
 * uma aplicação, e cada jogada vira um resultado.
 */
function converter(api: DadosDaApi): DadosModolume {
  const turmaDoAluno = new Map(api.alunos.map((a) => [a.id, a.turmaId]));
  const atividades = new Map<string, DadosModolume["atividades"][number]>();
  const aplicacoes = new Map<string, DadosModolume["aplicacoes"][number]>();
  const resultados: DadosModolume["resultados"] = [];
  for (const j of api.jogadas) {
    const turmaId = turmaDoAluno.get(j.alunoId);
    if (!turmaId) continue;
    if (!atividades.has(j.missaoId))
      atividades.set(j.missaoId, {
        id: j.missaoId,
        professorId: api.professor.id,
        titulo: j.titulo,
        disciplina: "Matemática",
        formato: j.formato,
        objetivo: "",
        conteudo: {},
        criadaEm: j.data,
      });
    const idAplicacao = `${turmaId}|${j.missaoId}|${j.data}`;
    if (!aplicacoes.has(idAplicacao))
      aplicacoes.set(idAplicacao, { id: idAplicacao, atividadeId: j.missaoId, turmaId, data: j.data });
    resultados.push({
      id: j.id,
      aplicacaoId: idAplicacao,
      alunoId: j.alunoId,
      rodadas: j.rodadas,
      acertosDePrimeira: j.acertosDePrimeira,
      dicas: j.dicas,
      estrelas: j.estrelas,
      tentativas: j.tentativas,
      percentualConclusao: j.percentualConclusao,
      percentualAcerto: j.percentualAcerto,
      tempoSegundos: j.tempoSegundos,
    });
  }
  return {
    instituicoes: [{ id: api.instituicao.id, nome: api.instituicao.nome }],
    professores: [api.professor],
    turmas: api.turmas.map((t) => ({
      id: t.id,
      professorId: t.professorId,
      nome: t.nome,
      serie: t.serie,
      periodo: t.periodo as "manhã" | "tarde" | "integral",
    })),
    alunos: api.alunos.map((a) => ({ id: a.id, turmaId: a.turmaId, nome: a.nome, codigo: a.codigo })),
    atividades: [...atividades.values()],
    aplicacoes: [...aplicacoes.values()],
    resultados,
    objetivos: [],
  } as DadosModolume;
}

const sessaoAtual = cache(async () => lerSessao((await cookies()).get(COOKIE_SESSAO)?.value));

/** Token da API do professor logado (usado pelas outras partes do painel que falam com a API). */
export async function tokenDaApi() {
  const sessao = await sessaoAtual();
  if (!sessao?.token) redirect("/entrar?expirou=1");
  return sessao.token;
}

/** Acesso do aluno ao app (ADR 0017): o código que o professor repassa e a situação do PIN. */
export interface AcessoDoAluno {
  codigo: string;
  pinCriado: boolean;
  /** Bloqueado por PINs errados até esta data (ISO), ou null. */
  bloqueadoAte: string | null;
}

/** Tudo o que o painel lê, uma vez por requisição, com o avatar e o acesso de cada aluno. */
const carregar = cache(
  async (): Promise<{
    dados: DadosModolume;
    avatares: Record<string, string>;
    acessos: Record<string, AcessoDoAluno>;
  }> => {
    if (!usandoApi()) return { dados: await demonstracao().carregarTudo(), avatares: {}, acessos: {} };
    try {
      const api = await chamarApi<DadosDaApi>("/professor/dados", { token: await tokenDaApi() });
      const avatares = Object.fromEntries(api.alunos.filter((a) => a.avatarSvg).map((a) => [a.id, a.avatarSvg!]));
      const acessos = Object.fromEntries(
        api.alunos.map((a) => [
          a.id,
          { codigo: a.codigoAcesso, pinCriado: a.pinCriado, bloqueadoAte: a.bloqueadoAte } satisfies AcessoDoAluno,
        ]),
      );
      return { dados: converter(api), avatares, acessos };
    } catch (e) {
      // token vencido ou de outro servidor: volta ao login
      if (e instanceof ErroApi && (e.status === 401 || e.status === 403)) redirect("/entrar?expirou=1");
      throw e;
    }
  },
);
const carregarTudo = async () => (await carregar()).dados;

/** Avatar (SVG) que cada aluno escolheu no app, por id do aluno. */
export async function avataresDosAlunos() {
  return (await carregar()).avatares;
}

/** Código de acesso e situação do PIN de um aluno (null no modo demonstração, sem API). */
export async function acessoDoAluno(alunoId: string): Promise<AcessoDoAluno | null> {
  return (await carregar()).acessos[alunoId] ?? null;
}

/**
 * Professor da sessão atual; sem sessão válida, volta para o login. Guardado
 * por requisição: o menu e a página usam o mesmo resultado.
 */
export const professorLogado = cache(async function professorLogado(): Promise<Professor> {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/entrar");
  const todos = await carregarTudo();
  const professor = todos.professores.find((p) => p.id === sessao.professorId);
  if (!professor) redirect("/entrar?expirou=1");
  return professor;
});

/** Escola do professor (aparece no cabeçalho do painel). */
export async function escolaDoProfessor(professor: Professor) {
  const todos = await carregarTudo();
  return todos.instituicoes.find((i) => i.id === professor.instituicaoId) ?? null;
}

/** Procura o professor pelo e-mail (para o login de demonstração, sem API). */
export async function professorPorEmail(email: string): Promise<Professor | undefined> {
  const todos = await demonstracao().carregarTudo();
  return todos.professores.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
}

/** Só os dados das turmas do professor: um professor nunca vê turmas de outro. */
function recortar(todos: DadosModolume, professorId: string): DadosModolume {
  const turmas = todos.turmas.filter((t) => t.professorId === professorId);
  const ids = new Set(turmas.map((t) => t.id));
  const aplicacoes = todos.aplicacoes.filter((a) => ids.has(a.turmaId));
  const idsAplic = new Set(aplicacoes.map((a) => a.id));
  return {
    ...todos,
    turmas,
    alunos: todos.alunos.filter((a) => ids.has(a.turmaId)),
    aplicacoes,
    resultados: todos.resultados.filter((r) => idsAplic.has(r.aplicacaoId)),
  };
}

/** Critério de atenção: acerto médio abaixo de 60% ou queda de 10 pontos ou mais no período. */
export const CRITERIO_ATENCAO = { acerto: 60, queda: -10 } as const;

type LinhaAtencao = { atividades: number; acertoMedio: number; tendencia: number };
export const pedeAtencao = (a: LinhaAtencao) =>
  a.atividades > 0 && (a.acertoMedio < CRITERIO_ATENCAO.acerto || a.tendencia <= CRITERIO_ATENCAO.queda);

/** Por que o aluno foi destacado, em uma frase direta. */
export function motivoAtencao(a: LinhaAtencao): string {
  const baixo = a.acertoMedio < CRITERIO_ATENCAO.acerto;
  const caiu = a.tendencia <= CRITERIO_ATENCAO.queda;
  if (baixo && caiu) return `Acerto abaixo de 60% e queda de ${Math.abs(a.tendencia)} pontos no período`;
  if (caiu) return `Queda de ${Math.abs(a.tendencia)} pontos no período`;
  if (a.tendencia >= 5) return `Acerto abaixo de 60%, mas subiu ${a.tendencia} pontos no período`;
  return "Acerto abaixo de 60%";
}

/** Período coberto pelos dados (primeira e última aplicação). */
function periodo(meus: DadosModolume) {
  const datas = meus.aplicacoes.map((a) => a.data).sort();
  return { inicio: datas[0] ?? "", fim: datas.at(-1) ?? "" };
}

/** Tudo o que a visão geral precisa, já calculado pelo núcleo. */
export async function visaoGeral(professor: Professor) {
  const meus = recortar(await carregarTudo(), professor.id);
  const alunos = desempenhoPorAluno(meus);
  return {
    resumo: resumoGeral(meus),
    periodo: periodo(meus),
    formatos: desempenhoPorFormato(meus).sort((a, b) => b.acertoMedio - a.acertoMedio),
    turmas: meus.turmas.map((t) => ({
      turma: t,
      alunos: meus.alunos.filter((a) => a.turmaId === t.id).length,
      resumo: resumoGeral(meus, { turmaId: t.id }),
    })),
    // referência para acompanhar, não diagnóstico
    atencao: alunos.filter(pedeAtencao).sort((a, b) => a.acertoMedio - b.acertoMedio),
  };
}

/** Carrega só os dados do professor (recorte por turma), uma vez por requisição. */
const meusDados = cache(async (professor: Professor) => recortar(await carregarTudo(), professor.id));

/** Turmas do professor com o resumo de cada uma e os formatos mais forte e mais fraco. */
export async function listaDeTurmas(professor: Professor) {
  const meus = await meusDados(professor);
  return meus.turmas.map((t) => {
    const formatos = desempenhoPorFormato(meus, { turmaId: t.id }).sort((a, b) => b.acertoMedio - a.acertoMedio);
    const linhas = desempenhoPorAluno(meus, { turmaId: t.id });
    return {
      turma: t,
      alunos: meus.alunos.filter((a) => a.turmaId === t.id).length,
      resumo: resumoGeral(meus, { turmaId: t.id }),
      formatos,
      melhorFormato: formatos[0] ?? null,
      piorFormato: formatos.length > 1 ? formatos[formatos.length - 1]! : null,
      atencao: linhas.filter(pedeAtencao).length,
      metas: indicadoresSmart(meus, { turmaId: t.id }),
    };
  });
}

/** Uma turma do professor com a linha de cada aluno; null se a turma não for dele. */
export async function detalheDaTurma(professor: Professor, turmaId: string) {
  const meus = await meusDados(professor);
  const turma = meus.turmas.find((t) => t.id === turmaId);
  if (!turma) return null;
  const alunos = desempenhoPorAluno(meus, { turmaId }).map((linha) => {
    const perfil = perfilDoAluno(meus, linha.alunoId);
    const formatos = perfil?.porFormato ?? [];
    return {
      ...linha,
      dificuldade: formatos.length > 1 ? formatos[formatos.length - 1]! : null,
      recentes: resultadosRecentes(meus, linha.alunoId, 8),
    };
  });
  return {
    turma,
    periodo: periodo(meus),
    resumo: resumoGeral(meus, { turmaId }),
    formatos: desempenhoPorFormato(meus, { turmaId }).sort((a, b) => b.acertoMedio - a.acertoMedio),
    alunos,
    metas: indicadoresSmart(meus, { turmaId }),
  };
}

/** Perfil de um aluno de uma turma do professor; null se o aluno não for de uma turma dele. */
export async function detalheDoAluno(professor: Professor, alunoId: string) {
  const meus = await meusDados(professor);
  const perfil = perfilDoAluno(meus, alunoId);
  if (!perfil) return null;
  const turma = meus.turmas.find((t) => t.id === perfil.aluno.turmaId)!;
  const mediaTurma = resumoGeral(meus, { turmaId: turma.id }).acertoMedio;
  // média da turma em cada formato, para comparar o aluno no mesmo formato
  const mediaTurmaPorFormato = Object.fromEntries(
    desempenhoPorFormato(meus, { turmaId: turma.id }).map((f) => [f.formato, f.acertoMedio]),
  ) as Record<string, number>;
  const proprio = { ...meus, resultados: meus.resultados.filter((r) => r.alunoId === alunoId) };
  const idsAplic = new Set(proprio.resultados.map((r) => r.aplicacaoId));
  return {
    ...perfil,
    jeitoPrincipal: analisarAprendizagem(jogadasDeAprendizagem(meus, alunoId)).jeitoPrincipal?.jeito ?? null,
    pontas: pentagrama(
      [jogadasDeAprendizagem(meus, alunoId)],
      meus.alunos.filter((a) => a.turmaId === turma.id).map((a) => jogadasDeAprendizagem(meus, a.id)),
    ),
    turma,
    mediaTurma,
    mediaTurmaPorFormato,
    periodo: periodo({ ...proprio, aplicacoes: meus.aplicacoes.filter((a) => idsAplic.has(a.id)) }),
    recentes: resultadosRecentes(meus, alunoId, 12),
  };
}

/** Últimos resultados de um aluno, do mais antigo ao mais recente, com o título da atividade. */
function resultadosRecentes(meus: DadosModolume, alunoId: string, quantos: number) {
  const aplicacao = new Map(meus.aplicacoes.map((a) => [a.id, a]));
  const atividade = new Map(meus.atividades.map((a) => [a.id, a]));
  return meus.resultados
    .filter((r) => r.alunoId === alunoId)
    .map((r) => {
      const ap = aplicacao.get(r.aplicacaoId);
      const at = ap ? atividade.get(ap.atividadeId) : undefined;
      return { id: r.id, acerto: r.percentualAcerto, data: ap?.data ?? "", titulo: at?.titulo ?? "Atividade" };
    })
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(-quantos);
}

/** Todos os alunos do professor, com a turma e o formato de mais dificuldade. */
export async function listaDeAlunos(professor: Professor) {
  const meus = await meusDados(professor);
  const turmas = new Map(meus.turmas.map((t) => [t.id, t]));
  return desempenhoPorAluno(meus).map((linha) => {
    const formatos = perfilDoAluno(meus, linha.alunoId)?.porFormato ?? [];
    return {
      ...linha,
      turma: turmas.get(linha.turmaId)!,
      dificuldade: formatos.length > 1 ? formatos[formatos.length - 1]! : null,
    };
  });
}

/** O que o formulário de plano de aula precisa de cada turma: acerto por formato e alunos. */
export async function opcoesDePlanejamento(professor: Professor) {
  const meus = await meusDados(professor);
  return meus.turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    formatos: Object.fromEntries(
      desempenhoPorFormato(meus, { turmaId: t.id }).map((f) => [
        f.formato,
        { acerto: f.acertoMedio, amostra: f.amostra },
      ]),
    ) as Record<string, { acerto: number; amostra: number }>,
    alunos: desempenhoPorAluno(meus, { turmaId: t.id })
      .map((a) => ({
        id: a.alunoId,
        nome: a.nome,
        acerto: a.acertoMedio,
        atencao: pedeAtencao(a),
        motivo: pedeAtencao(a) ? motivoAtencao(a) : "",
      }))
      // quem pede atenção primeiro, depois por nome
      .sort((a, b) => Number(b.atencao) - Number(a.atencao) || a.nome.localeCompare(b.nome)),
  }));
}

export type OpcoesPlanejamento = Awaited<ReturnType<typeof opcoesDePlanejamento>>;

/** Pentagrama da turma e de cada aluno, com o jeito em que cada um vai melhor. */
export async function habilidadesDaTurma(professor: Professor, turmaId: string) {
  const meus = await meusDados(professor);
  const turma = meus.turmas.find((t) => t.id === turmaId);
  if (!turma) return null;
  const jogadasDaTurma = meus.alunos.filter((a) => a.turmaId === turmaId).map((a) => jogadasDeAprendizagem(meus, a.id));
  const todas = meus.alunos.map((a) => jogadasDeAprendizagem(meus, a.id));
  const alunos = desempenhoPorAluno(meus, { turmaId })
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((linha) => {
      const pontas = pentagrama([jogadasDeAprendizagem(meus, linha.alunoId)], jogadasDaTurma);
      return {
        ...linha,
        pontas,
        forte: analisarAprendizagem(jogadasDeAprendizagem(meus, linha.alunoId)).jeitoPrincipal?.jeito ?? null,
      };
    });
  return {
    turma,
    // no pentagrama da turma, a comparação é com a média de todas as turmas do professor
    pontas: pentagrama(jogadasDaTurma, todas),
    alunos,
  };
}

/** Tudo o que a página de desempenho precisa, por turma. */
export async function desempenhoDasTurmas(professor: Professor) {
  const meus = await meusDados(professor);
  return meus.turmas.map((t) => {
    const alunos = desempenhoPorAluno(meus, { turmaId: t.id }).filter((a) => a.atividades > 0);
    return {
      turma: t,
      resumo: resumoGeral(meus, { turmaId: t.id }),
      evolucao: evolucaoMensal(meus, { turmaId: t.id }),
      formatos: desempenhoPorFormato(meus, { turmaId: t.id }),
      metas: indicadoresSmart(meus, { turmaId: t.id }),
      // quantos alunos em cada faixa de acerto médio
      faixas: {
        alto: alunos.filter((a) => a.acertoMedio >= 80).length,
        medio: alunos.filter((a) => a.acertoMedio >= 60 && a.acertoMedio < 80).length,
        baixo: alunos.filter((a) => a.acertoMedio < 60).length,
      },
    };
  });
}

/** Todas as turmas do professor juntas: evolução e formatos (para quando há turmas demais para comparar uma a uma). */
export async function desempenhoGeral(professor: Professor) {
  const meus = await meusDados(professor);
  return {
    resumo: resumoGeral(meus),
    evolucao: evolucaoMensal(meus),
    formatos: desempenhoPorFormato(meus),
  };
}
