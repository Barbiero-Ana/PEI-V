import { constelacaoDoNivel, desafioDoDia, mapaConcluido, pontosDaJogada, pontosNecessarios } from "./constelacoes";
import { nivelDaMissao, type ResultadoJogada } from "./missoes";

export interface ProgressoAluno {
  progresso: Record<string, { estrelas: 0 | 1 | 2 | 3; jogadas: number; melhorAcerto: number }>;
  pontosPorNivel: Record<string, number>;
  constelacoes: Record<string, string>;
  desafios: Record<string, string>;
  bonusDiarios?: Record<string, number>;
  bonusMapas?: Record<string, number>;
  gastos: number;
  compras: string[];
  dias: string[];
}
export const progressoVazio = (): ProgressoAluno => ({
  progresso: {},
  pontosPorNivel: {},
  constelacoes: {},
  desafios: {},
  gastos: 0,
  compras: [],
  dias: [],
});
export const saldoDeLuzes = (p: ProgressoAluno) =>
  Object.values(p.pontosPorNivel).reduce((s, v) => s + v, 0) - p.gastos;

/** Projeção compartilhada. O chamador garante unicidade do ID antes de aplicar. */
export function creditarJogada(p: ProgressoAluno, r: ResultadoJogada): ProgressoAluno {
  const nivel = nivelDaMissao(r.missaoId);
  if (!nivel) return p;
  const eDesafio = desafioDoDia(r.data).id === r.missaoId;
  // Entre tentativas concorrentes, dobra a melhor recompensa base uma única vez.
  // Desafios legados sem discriminação do bônus permanecem quitados.
  const bonusAnterior = p.bonusDiarios?.[r.data] ?? 0;
  const bonusDiario =
    eDesafio && (!p.desafios[r.data] || p.bonusDiarios?.[r.data] !== undefined)
      ? Math.max(bonusAnterior, pontosDaJogada(r))
      : bonusAnterior;
  const desafio = eDesafio && !p.desafios[r.data];
  const anterior = p.progresso[r.missaoId];
  const progresso = {
    ...p.progresso,
    [r.missaoId]: {
      estrelas: Math.max(anterior?.estrelas ?? 0, r.estrelas) as 1 | 2 | 3,
      jogadas: (anterior?.jogadas ?? 0) + 1,
      melhorAcerto: Math.max(anterior?.melhorAcerto ?? 0, r.percentualAcerto),
    },
  };
  const constelacao = constelacaoDoNivel(nivel.numero);
  const completo = mapaConcluido(nivel.numero, progresso);
  const ganho = pontosDaJogada(r) + bonusDiario - bonusAnterior;
  const bonusMapaAnterior = p.bonusMapas?.[nivel.numero] ?? 0;
  const pontos = (p.pontosPorNivel[nivel.numero] ?? 0) - bonusMapaAnterior + ganho;
  // O preenchimento do mapa acontece uma vez. Reenvios são deduplicados antes da projeção.
  const bonus =
    completo && (!p.constelacoes[constelacao.id] || p.bonusMapas?.[nivel.numero] !== undefined)
      ? Math.max(0, pontosNecessarios(constelacao) - pontos)
      : 0;
  return {
    ...p,
    progresso,
    bonusDiarios: {
      ...p.bonusDiarios,
      ...(eDesafio && (!p.desafios[r.data] || p.bonusDiarios?.[r.data] !== undefined) ? { [r.data]: bonusDiario } : {}),
    },
    bonusMapas: {
      ...p.bonusMapas,
      ...(completo && (!p.constelacoes[constelacao.id] || p.bonusMapas?.[nivel.numero] !== undefined)
        ? { [nivel.numero]: bonus }
        : {}),
    },
    pontosPorNivel: { ...p.pontosPorNivel, [nivel.numero]: pontos + bonus },
    constelacoes:
      completo && !p.constelacoes[constelacao.id] ? { ...p.constelacoes, [constelacao.id]: r.data } : p.constelacoes,
    desafios: desafio ? { ...p.desafios, [r.data]: r.missaoId } : p.desafios,
    dias: [...new Set([...p.dias, r.data])].sort(),
  };
}

/** Preços são contratos do domínio. O servidor nunca aceita o preço enviado pelo aparelho. */
export const PRECOS_LOJA: Readonly<Record<string, number>> = {
  "acessorio:sailormoonCrown": 20,
  "acessorio:catEars": 14,
  "acessorio:sunglasses": 12,
  "acessorio:sleepMask": 10,
  "acessorio:clownNose": 8,
  "acessorio:mustache": 8,
  "fundo:6": 15,
  "fundo:7": 12,
  "fundo:8": 10,
  "capa-doces": 20,
  "capa-neve": 25,
  "capa-galaxia": 30,
  "capa-mar": 35,
  "capa-arcoiris": 40,
};
export function comprarItem(p: ProgressoAluno, itemId: string): ProgressoAluno | null {
  if (p.compras.includes(itemId)) return p;
  if (!Object.hasOwn(PRECOS_LOJA, itemId)) return null;
  const preco = PRECOS_LOJA[itemId];
  if (preco === undefined || saldoDeLuzes(p) < preco) return null;
  return { ...p, gastos: p.gastos + preco, compras: [...p.compras, itemId] };
}

/** Índices persistidos pela versão anterior do editor de capas. */
export const CAPAS_PAGAS_POR_INDICE: Readonly<Record<number, string>> = {
  7: "capa-doces",
  8: "capa-neve",
  9: "capa-galaxia",
  10: "capa-mar",
  11: "capa-arcoiris",
};
