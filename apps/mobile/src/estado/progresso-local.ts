import {
  CAPAS_PAGAS_POR_INDICE,
  comprarItem,
  creditarJogada,
  type ProgressoAluno,
  type ResultadoJogada,
} from "@modolume/core";

export interface ProgressoRemoto extends ProgressoAluno {
  revisao: number;
  jogadasConfirmadas: string[];
  resultados: ResultadoJogada[];
}
export interface ControleProgresso {
  versaoProgresso: 2;
  dispositivoId: string;
  legado?: ProgressoAluno;
  movimentos: { id: string; resultado: ResultadoJogada }[];
  comprasPendentes: string[];
  revisao: number;
  avisoSincronizacao?: string;
}

/** Leituras antigas nunca desfazem uma confirmação mais recente. Ganhos locais continuam pendentes. */
export function conciliarProgresso<T extends ProgressoAluno & ControleProgresso & { resultados: ResultadoJogada[] }>(
  local: T,
  remoto: ProgressoRemoto,
  recusadas: string[] = [],
  comprasRecusadas: string[] = [],
  confirmarLegado = false,
): T {
  if (remoto.revisao < local.revisao) return local;
  const confirmadas = new Set([...remoto.jogadasConfirmadas, ...recusadas]);
  const movimentos = local.movimentos.filter((m) => !confirmadas.has(m.id));
  const comprasPendentes = local.comprasPendentes.filter(
    (id) => !remoto.compras.includes(id) && !comprasRecusadas.includes(id),
  );
  let projetado: ProgressoAluno = remoto;
  for (const m of movimentos) projetado = creditarJogada(projetado, m.resultado);
  for (const id of comprasPendentes) projetado = comprarItem(projetado, id) ?? projetado;
  const porId = new Map<string, ResultadoJogada>();
  for (const r of [...local.resultados, ...remoto.resultados])
    if (r.id && !recusadas.includes(r.id)) porId.set(r.id, r);
  const assinatura = (r: ResultadoJogada) =>
    [
      r.missaoId,
      r.formato,
      r.data,
      r.rodadas,
      r.tentativas,
      r.acertosDePrimeira,
      r.percentualAcerto,
      r.tempoSegundos,
      r.dicas ?? 0,
    ].join("|");
  const antigasRemotas = new Map<string, number>();
  for (const r of remoto.resultados) antigasRemotas.set(assinatura(r), (antigasRemotas.get(assinatura(r)) ?? 0) + 1);
  const antigasLocais = local.resultados.filter((r) => {
    if (r.id) return false;
    const quantidade = antigasRemotas.get(assinatura(r)) ?? 0;
    if (!quantidade) return true;
    antigasRemotas.set(assinatura(r), quantidade - 1);
    return false;
  });
  return {
    ...local,
    ...projetado,
    movimentos,
    comprasPendentes,
    legado: confirmarLegado ? undefined : local.legado,
    revisao: remoto.revisao,
    resultados: [...antigasLocais, ...porId.values()],
    avisoSincronizacao: comprasRecusadas.length
      ? "Algumas compras não foram confirmadas: o saldo mudou em outro aparelho. Suas luzes não foram cobradas por esses itens."
      : local.avisoSincronizacao,
  };
}

/** Uma compra recusada não deixa um cosmético sem posse equipado. */
export function retirarItensRecusados<T extends { rosto?: { acessorio: string; fundo: number }; capa?: number }>(
  jogador: T,
  recusadas: string[],
): T {
  const rosto = jogador.rosto ? { ...jogador.rosto } : undefined;
  if (rosto) {
    if (recusadas.includes(`acessorio:${rosto.acessorio}`)) rosto.acessorio = "nenhum";
    if (recusadas.includes(`fundo:${rosto.fundo}`)) rosto.fundo = 0;
  }
  const capa =
    jogador.capa !== undefined && recusadas.includes(CAPAS_PAGAS_POR_INDICE[jogador.capa] ?? "") ? 0 : jogador.capa;
  return { ...jogador, rosto, capa };
}
