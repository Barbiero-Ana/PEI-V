import { FORMATOS_ATIVIDADE, type FormatoId } from "./formato";
import { MISSOES, type ResultadoJogada } from "./missoes";

/**
 * Análise do jeito de aprender do aluno, a partir das jogadas.
 *
 * Para cada tipo de atividade, olha quatro sinais e não só o acerto:
 * - acerto de primeira (o principal), dando mais peso às jogadas recentes;
 * - autonomia: em quantas fases resolveu sem pedir dica;
 * - precisão: quantas tentativas precisou por fase;
 * - evolução: se as jogadas recentes estão melhores que as primeiras.
 *
 * Também mede a confiança (quanto dado existe) para não tirar conclusão
 * de uma jogada só. É uma referência para o aluno e o professor, não um
 * diagnóstico.
 */

/** Jeitos de aprender, agrupando os tipos de atividade parecidos. */
export const JEITOS = {
  "associacao-visual": { jeito: "Visual", frase: "vendo e ligando imagens aos números" },
  montagem: { jeito: "Mãos na massa", frase: "montando e juntando peças" },
  manipulacao: { jeito: "Mãos na massa", frase: "mexendo nos objetos até chegar na resposta" },
  sequencia: { jeito: "Lógico", frase: "organizando as coisas em ordem" },
  completar: { jeito: "Simbólico", frase: "trabalhando com números e contas" },
  objetiva: { jeito: "Simbólico", frase: "escolhendo entre alternativas" },
  "exploracao-3d": { jeito: "Espacial", frase: "girando e construindo formas no espaço" },
} as const satisfies Record<FormatoId, { jeito: string; frase: string }>;

export type Confianca = "nenhuma" | "pouca" | "boa";
export type Tendencia = "subindo" | "estavel" | "caindo" | null;
export type NivelAprendizagem = "forte" | "crescendo" | "treinar" | "novo";

export interface AnaliseFormato {
  formato: FormatoId;
  rotulo: string;
  jeito: string;
  jogadas: number;
  fases: number;
  /** Acerto de primeira, com mais peso para as jogadas recentes (0–100). */
  acerto: number | null;
  /** Fases resolvidas sem pedir dica (0–100). */
  autonomia: number | null;
  /** Tentativas por fase (1 = acertou tudo de primeira). */
  tentativasPorFase: number | null;
  /** Nota combinada usada no radar (0–100). */
  dominio: number | null;
  tendencia: Tendencia;
  confianca: Confianca;
  nivel: NivelAprendizagem;
}

export interface AnaliseAprendizagem {
  formatos: AnaliseFormato[];
  /** Jeito em que o aluno vai melhor (só com dado suficiente). */
  jeitoPrincipal: { jeito: string; frase: string } | null;
  fortes: AnaliseFormato[];
  crescendo: AnaliseFormato[];
  treinar: AnaliseFormato[];
  novos: AnaliseFormato[];
  /** Frases curtas e organizadas sobre o que os dados mostram. */
  observacoes: string[];
  /** Missão sugerida para treinar o ponto mais fraco (ou experimentar um tipo novo). */
  sugestao: { missaoId: string; motivo: string } | null;
  totalJogadas: number;
}

const media = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

/** Média com peso crescente: a jogada mais recente vale mais. */
function mediaRecente(ns: number[]) {
  if (!ns.length) return 0;
  let soma = 0;
  let pesos = 0;
  ns.forEach((n, i) => {
    const peso = 1 + i / Math.max(1, ns.length - 1);
    soma += n * peso;
    pesos += peso;
  });
  return soma / pesos;
}

function tendenciaDe(acertos: number[]): Tendencia {
  if (acertos.length < 3) return null;
  const metade = Math.floor(acertos.length / 2);
  const delta = media(acertos.slice(-metade)) - media(acertos.slice(0, metade));
  if (delta >= 12) return "subindo";
  if (delta <= -12) return "caindo";
  return "estavel";
}

export function analisarAprendizagem(resultados: ResultadoJogada[]): AnaliseAprendizagem {
  // só os tipos de atividade que existem nas missões do app
  const tipos = FORMATOS_ATIVIDADE.filter((f) => MISSOES.some((m) => m.formato === f.id));

  const formatos: AnaliseFormato[] = tipos.map((f) => {
    // as últimas 10 jogadas do tipo, em ordem de data
    const rs = resultados.filter((r) => r.formato === f.id).slice(-10);
    const base = { formato: f.id, rotulo: f.rotulo, jeito: JEITOS[f.id].jeito };
    if (!rs.length) {
      return {
        ...base,
        jogadas: 0,
        fases: 0,
        acerto: null,
        autonomia: null,
        tentativasPorFase: null,
        dominio: null,
        tendencia: null,
        confianca: "nenhuma",
        nivel: "novo",
      };
    }
    const fases = rs.reduce((s, r) => s + r.rodadas, 0);
    const acerto = Math.round(mediaRecente(rs.map((r) => r.percentualAcerto)));
    const dicas = rs.reduce((s, r) => s + (r.dicas ?? 0), 0);
    const autonomia = Math.round(Math.max(0, 1 - dicas / Math.max(1, fases)) * 100);
    const tentativasPorFase = Math.round((rs.reduce((s, r) => s + r.tentativas, 0) / Math.max(1, fases)) * 10) / 10;
    // precisão: 1 tentativa por fase = 100; 3 ou mais = 0
    const precisao = Math.max(0, Math.min(100, ((3 - tentativasPorFase) / 2) * 100));
    const dominio = Math.round(acerto * 0.65 + autonomia * 0.2 + precisao * 0.15);
    const confianca: Confianca = rs.length >= 2 && fases >= 6 ? "boa" : "pouca";
    const nivel: NivelAprendizagem = dominio >= 75 ? "forte" : dominio >= 50 ? "crescendo" : "treinar";
    return {
      ...base,
      jogadas: rs.length,
      fases,
      acerto,
      autonomia,
      tentativasPorFase,
      dominio,
      tendencia: tendenciaDe(rs.map((r) => r.percentualAcerto)),
      confianca,
      nivel,
    };
  });

  const jogados = formatos.filter((f) => f.dominio !== null);
  const porDominio = (a: AnaliseFormato, b: AnaliseFormato) => (b.dominio ?? 0) - (a.dominio ?? 0);
  const fortes = jogados.filter((f) => f.nivel === "forte").sort(porDominio);
  const crescendo = jogados.filter((f) => f.nivel === "crescendo").sort(porDominio);
  const treinar = jogados.filter((f) => f.nivel === "treinar").sort(porDominio);
  const novos = formatos.filter((f) => f.nivel === "novo");

  // jeito principal: o grupo com maior domínio médio, entre os que têm dado suficiente
  const grupos = new Map<string, number[]>();
  for (const f of jogados.filter((x) => x.confianca === "boa")) {
    grupos.set(f.jeito, [...(grupos.get(f.jeito) ?? []), f.dominio!]);
  }
  const melhorGrupo = [...grupos.entries()].sort((a, b) => media(b[1]) - media(a[1]))[0];
  const exemplo = melhorGrupo ? jogados.find((f) => f.jeito === melhorGrupo[0]) : undefined;
  const jeitoPrincipal =
    melhorGrupo && media(melhorGrupo[1]) >= 60 && exemplo
      ? { jeito: melhorGrupo[0], frase: JEITOS[exemplo.formato].frase }
      : null;

  const observacoes: string[] = [];
  for (const f of jogados) {
    if (f.tendencia === "subindo")
      observacoes.push(`Está melhorando em ${f.rotulo.toLowerCase()}: as últimas jogadas foram melhores.`);
  }
  for (const f of jogados) {
    if (f.tendencia === "caindo")
      observacoes.push(`Em ${f.rotulo.toLowerCase()}, as últimas jogadas foram mais difíceis. Vale voltar com calma.`);
  }
  const maisDicas = [...jogados].sort((a, b) => (a.autonomia ?? 100) - (b.autonomia ?? 100))[0];
  if (maisDicas && (maisDicas.autonomia ?? 100) < 70)
    observacoes.push(`Usa mais a lâmpada em ${maisDicas.rotulo.toLowerCase()}. Pedir dica faz parte de aprender!`);
  const semDicas = jogados.filter((f) => f.confianca === "boa" && (f.autonomia ?? 0) === 100);
  if (semDicas.length)
    observacoes.push(`Resolve ${semDicas.map((f) => f.rotulo.toLowerCase()).join(" e ")} sem pedir dica.`);
  const poucos = jogados.filter((f) => f.confianca === "pouca");
  if (poucos.length)
    observacoes.push(
      `Ainda tem pouca jogada em ${poucos.map((f) => f.rotulo.toLowerCase()).join(", ")}: jogando mais, a análise fica mais certeira.`,
    );

  // sugestão: treinar o mais fraco; se não houver, experimentar um tipo novo
  const alvo = treinar.at(-1) ?? crescendo.at(-1);
  const novo = novos[0];
  const missaoDo = (formato: FormatoId) => MISSOES.find((m) => m.formato === formato);
  const sugestao = alvo
    ? { missaoId: missaoDo(alvo.formato)!.id, motivo: `para treinar ${alvo.rotulo.toLowerCase()}` }
    : novo
      ? { missaoId: missaoDo(novo.formato)!.id, motivo: `para experimentar ${novo.rotulo.toLowerCase()}` }
      : null;

  return {
    formatos,
    jeitoPrincipal,
    fortes,
    crescendo,
    treinar,
    novos,
    observacoes: observacoes.slice(0, 4),
    sugestao,
    totalJogadas: resultados.length,
  };
}
