import { FORMATOS_ATIVIDADE, rotuloFormato, type FormatoId } from "./formats";
import type { Id, DadosModolume, Resultado } from "./types";

/**
 * Cálculo dos indicadores apresentados no painel do professor.
 *
 * Importante: são referências pedagógicas, não diagnóstico. Nenhuma função aqui
 * classifica o aluno — apenas resume desempenho observado por formato e no tempo.
 */

const media = (ns: number[]): number => (ns.length === 0 ? 0 : ns.reduce((s, n) => s + n, 0) / ns.length);
const arredonda = (n: number, casas = 0): number => {
  const f = 10 ** casas;
  return Math.round(n * f) / f;
};

export interface Filtro {
  turmaId?: Id;
  formato?: FormatoId;
}

interface Contexto {
  resultados: (Resultado & { formato: FormatoId; data: string; turmaId: Id })[];
}

/** Junta cada resultado com o formato e a data da atividade aplicada. */
function contextualizar(data: DadosModolume, filtro: Filtro = {}): Contexto {
  const aplicPorId = new Map(data.aplicacoes.map((a) => [a.id, a]));
  const ativPorId = new Map(data.atividades.map((a) => [a.id, a]));

  const resultados = data.resultados.flatMap((r) => {
    const aplic = aplicPorId.get(r.aplicacaoId);
    if (!aplic) return [];
    const ativ = ativPorId.get(aplic.atividadeId);
    if (!ativ) return [];
    if (filtro.turmaId && aplic.turmaId !== filtro.turmaId) return [];
    if (filtro.formato && ativ.formato !== filtro.formato) return [];
    return [{ ...r, formato: ativ.formato, data: aplic.data, turmaId: aplic.turmaId }];
  });

  return { resultados };
}

export interface ResumoGeral {
  atividadesAplicadas: number;
  alunosAtivos: number;
  acertoMedio: number;
  conclusaoMedia: number;
  tentativasMedia: number;
}

export function resumoGeral(data: DadosModolume, filtro: Filtro = {}): ResumoGeral {
  const { resultados } = contextualizar(data, filtro);
  const aplicacoes = new Set(resultados.map((r) => r.aplicacaoId));
  const alunos = new Set(resultados.map((r) => r.alunoId));
  return {
    atividadesAplicadas: aplicacoes.size,
    alunosAtivos: alunos.size,
    acertoMedio: arredonda(media(resultados.map((r) => r.percentualAcerto))),
    conclusaoMedia: arredonda(media(resultados.map((r) => r.percentualConclusao))),
    tentativasMedia: arredonda(media(resultados.map((r) => r.tentativas)), 1),
  };
}

export interface DesempenhoFormato {
  formato: FormatoId;
  rotulo: string;
  acertoMedio: number;
  conclusaoMedia: number;
  tentativasMedia: number;
  amostra: number;
}

export function desempenhoPorFormato(data: DadosModolume, filtro: Filtro = {}): DesempenhoFormato[] {
  const { resultados } = contextualizar(data, { turmaId: filtro.turmaId });
  return FORMATOS_ATIVIDADE.map((f) => {
    const r = resultados.filter((x) => x.formato === f.id);
    return {
      formato: f.id,
      rotulo: f.rotulo,
      acertoMedio: arredonda(media(r.map((x) => x.percentualAcerto))),
      conclusaoMedia: arredonda(media(r.map((x) => x.percentualConclusao))),
      tentativasMedia: arredonda(media(r.map((x) => x.tentativas)), 1),
      amostra: r.length,
    };
  }).filter((d) => d.amostra > 0);
}

export interface PontoEvolucao {
  data: string;
  rotulo: string;
  acertoMedio: number;
  conclusaoMedia: number;
  amostra: number;
}

const MESES_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function evolucaoMensal(data: DadosModolume, filtro: Filtro = {}): PontoEvolucao[] {
  const { resultados } = contextualizar(data, filtro);
  const porMes = new Map<string, typeof resultados>();
  for (const r of resultados) {
    const chave = r.data.slice(0, 7); // YYYY-MM
    const lista = porMes.get(chave) ?? [];
    lista.push(r);
    porMes.set(chave, lista);
  }
  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([chave, r]) => {
      const mes = Number(chave.slice(5, 7)) - 1;
      return {
        data: chave,
        rotulo: MESES_PT[mes] ?? chave,
        acertoMedio: arredonda(media(r.map((x) => x.percentualAcerto))),
        conclusaoMedia: arredonda(media(r.map((x) => x.percentualConclusao))),
        amostra: r.length,
      };
    });
}

export interface LinhaAluno {
  alunoId: Id;
  nome: string;
  codigo: string;
  turmaId: Id;
  acertoMedio: number;
  conclusaoMedia: number;
  tentativasMedia: number;
  atividades: number;
  /** Variação de acerto entre a primeira e a última metade do período. */
  tendencia: number;
  /** Formato com maior acerto médio (referência, não diagnóstico). */
  formatoDestaque: { formato: FormatoId; rotulo: string; acertoMedio: number } | null;
}

export function desempenhoPorAluno(data: DadosModolume, filtro: Filtro = {}): LinhaAluno[] {
  const ctx = contextualizar(data, filtro);
  const alunos = filtro.turmaId ? data.alunos.filter((a) => a.turmaId === filtro.turmaId) : data.alunos;

  return alunos
    .map((aluno) => {
      const rs = ctx.resultados.filter((r) => r.alunoId === aluno.id).sort((a, b) => a.data.localeCompare(b.data));

      if (rs.length === 0) {
        return {
          alunoId: aluno.id,
          nome: aluno.nome,
          codigo: aluno.codigo,
          turmaId: aluno.turmaId,
          acertoMedio: 0,
          conclusaoMedia: 0,
          tentativasMedia: 0,
          atividades: 0,
          tendencia: 0,
          formatoDestaque: null,
        } satisfies LinhaAluno;
      }

      const metade = Math.floor(rs.length / 2);
      const inicio = media(rs.slice(0, Math.max(1, metade)).map((r) => r.percentualAcerto));
      const fim = media(rs.slice(metade).map((r) => r.percentualAcerto));

      let formatoDestaque: LinhaAluno["formatoDestaque"] = null;
      for (const f of FORMATOS_ATIVIDADE) {
        const doFormato = rs.filter((r) => r.formato === f.id);
        if (doFormato.length === 0) continue;
        const acerto = arredonda(media(doFormato.map((r) => r.percentualAcerto)));
        if (!formatoDestaque || acerto > formatoDestaque.acertoMedio) {
          formatoDestaque = { formato: f.id, rotulo: f.rotulo, acertoMedio: acerto };
        }
      }

      return {
        alunoId: aluno.id,
        nome: aluno.nome,
        codigo: aluno.codigo,
        turmaId: aluno.turmaId,
        acertoMedio: arredonda(media(rs.map((r) => r.percentualAcerto))),
        conclusaoMedia: arredonda(media(rs.map((r) => r.percentualConclusao))),
        tentativasMedia: arredonda(media(rs.map((r) => r.tentativas)), 1),
        atividades: rs.length,
        tendencia: arredonda(fim - inicio),
        formatoDestaque,
      } satisfies LinhaAluno;
    })
    .sort((a, b) => b.acertoMedio - a.acertoMedio);
}

export interface PerfilAluno {
  aluno: { id: Id; nome: string; codigo: string; turmaId: Id };
  resumo: ResumoGeral;
  porFormato: DesempenhoFormato[];
  evolucao: PontoEvolucao[];
  tendencia: number;
}

export function perfilDoAluno(data: DadosModolume, alunoId: Id): PerfilAluno | null {
  const aluno = data.alunos.find((a) => a.id === alunoId);
  if (!aluno) return null;

  const dataFiltrada: DadosModolume = {
    ...data,
    resultados: data.resultados.filter((r) => r.alunoId === alunoId),
  };

  const linha = desempenhoPorAluno(data, { turmaId: aluno.turmaId }).find((l) => l.alunoId === alunoId);

  return {
    aluno: { id: aluno.id, nome: aluno.nome, codigo: aluno.codigo, turmaId: aluno.turmaId },
    resumo: resumoGeral(dataFiltrada),
    porFormato: desempenhoPorFormato(dataFiltrada).sort((a, b) => b.acertoMedio - a.acertoMedio),
    evolucao: evolucaoMensal(dataFiltrada),
    tendencia: linha?.tendencia ?? 0,
  };
}

export { rotuloFormato };
