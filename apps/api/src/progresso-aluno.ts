import { NIVEIS, type ProgressoAluno } from "@modolume/core";
import type { Prisma } from "@prisma/client";
import { dataDoBanco, dataIso } from "./conversao.js";

type Transacao = Prisma.TransactionClient;
export async function lerProgressoAluno(tx: Transacao, alunoId: string) {
  const [aluno, progressos, pontos, constelacoes, desafios, compras, dias, jogadas] = await Promise.all([
    tx.aluno.findUniqueOrThrow({
      where: { id: alunoId },
      select: { luzesGastas: true, progressoRevisao: true, ajustesProgresso: true },
    }),
    tx.progressoMissao.findMany({ where: { alunoId } }),
    tx.pontoMapa.findMany({ where: { alunoId } }),
    tx.constelacaoConquistada.findMany({ where: { alunoId }, include: { mapa: true } }),
    tx.desafioConcluido.findMany({ where: { alunoId } }),
    tx.compraLoja.findMany({ where: { alunoId } }),
    tx.jogada.findMany({ where: { alunoId }, distinct: ["data"], select: { data: true } }),
    tx.jogada.findMany({ where: { alunoId }, orderBy: [{ data: "asc" }, { id: "asc" }] }),
  ]);
  return {
    progresso: Object.fromEntries(
      progressos.map((p) => [
        p.missaoId,
        { estrelas: p.estrelas as 0 | 1 | 2 | 3, jogadas: p.vezes, melhorAcerto: p.melhorAcerto },
      ]),
    ),
    pontosPorNivel: Object.fromEntries(pontos.map((p) => [String(p.mapaNumero), p.pontos])),
    constelacoes: Object.fromEntries(constelacoes.map((c) => [c.mapa.constelacao, dataIso(c.data)])),
    desafios: Object.fromEntries(desafios.map((d) => [dataIso(d.data), d.missaoId])),
    gastos: aluno.luzesGastas,
    compras: compras.map((c) => c.itemId),
    dias: dias.map((d) => dataIso(d.data)).sort(),
    ...(aluno.ajustesProgresso as Pick<ProgressoAluno, "bonusDiarios" | "bonusMapas">),
    revisao: aluno.progressoRevisao,
    jogadasConfirmadas: jogadas.map((j) => j.id),
    resultados: jogadas.map((j) => ({
      id: j.id,
      missaoId: j.missaoId ?? j.atividadeId ?? j.id,
      formato: j.formatoId as import("@modolume/core").FormatoId,
      rodadas: j.rodadas,
      acertosDePrimeira: j.acertosDePrimeira,
      tentativas: j.tentativas,
      percentualConclusao: j.percentualConclusao,
      percentualAcerto: j.percentualAcerto,
      tempoSegundos: j.tempoSegundos,
      estrelas: j.estrelas as 1 | 2 | 3,
      dicas: j.dicas,
      data: dataIso(j.data),
    })),
  };
}

export async function salvarProgressoAluno(tx: Transacao, alunoId: string, p: ProgressoAluno) {
  for (const [missaoId, v] of Object.entries(p.progresso)) {
    const dados = { estrelas: v.estrelas, vezes: v.jogadas, melhorAcerto: v.melhorAcerto };
    await tx.progressoMissao.upsert({
      where: { alunoId_missaoId: { alunoId, missaoId } },
      create: { alunoId, missaoId, ...dados },
      update: dados,
    });
  }
  for (const [numero, pontos] of Object.entries(p.pontosPorNivel)) {
    const mapaNumero = Number(numero);
    await tx.pontoMapa.upsert({
      where: { alunoId_mapaNumero: { alunoId, mapaNumero } },
      create: { alunoId, mapaNumero, pontos },
      update: { pontos },
    });
  }
  await tx.constelacaoConquistada.createMany({
    data: Object.entries(p.constelacoes).flatMap(([id, data]) => {
      const mapaNumero = NIVEIS.find((n) => n.constelacao === id)?.numero;
      return mapaNumero ? [{ alunoId, mapaNumero, data: dataDoBanco(data) }] : [];
    }),
    skipDuplicates: true,
  });
  await tx.desafioConcluido.createMany({
    data: Object.entries(p.desafios).map(([data, missaoId]) => ({ alunoId, data: dataDoBanco(data), missaoId })),
    skipDuplicates: true,
  });
  await tx.compraLoja.createMany({ data: p.compras.map((itemId) => ({ alunoId, itemId })), skipDuplicates: true });
  await tx.aluno.update({
    where: { id: alunoId },
    data: {
      ajustesProgresso: { bonusDiarios: p.bonusDiarios ?? {}, bonusMapas: p.bonusMapas ?? {} },
      luzesGastas: p.gastos,
      progressoRevisao: { increment: 1 },
    },
  });
}

/** Compatibilidade: o retrato antigo é um piso histórico, nunca uma nova recompensa. */
export async function importarProgressoLegado(
  tx: Transacao,
  alunoId: string,
  atual: ProgressoAluno,
  legado: ProgressoAluno,
) {
  const missoes = new Set((await tx.missao.findMany({ select: { id: true } })).map((m) => m.id));
  const progresso = { ...atual.progresso };
  for (const [id, p] of Object.entries(legado.progresso)) {
    if (!missoes.has(id)) continue;
    const a = progresso[id];
    progresso[id] = {
      estrelas: Math.max(a?.estrelas ?? 0, p.estrelas) as 0 | 1 | 2 | 3,
      jogadas: Math.max(a?.jogadas ?? 0, p.jogadas),
      melhorAcerto: Math.max(a?.melhorAcerto ?? 0, p.melhorAcerto),
    };
  }
  const pontosPorNivel = { ...atual.pontosPorNivel };
  const mapas = new Set((await tx.mapa.findMany({ select: { numero: true } })).map((m) => m.numero));
  for (const n of NIVEIS)
    if (mapas.has(n.numero) && legado.pontosPorNivel[n.numero] !== undefined)
      pontosPorNivel[n.numero] = Math.max(pontosPorNivel[n.numero] ?? 0, legado.pontosPorNivel[n.numero]!);
  return {
    ...atual,
    progresso,
    pontosPorNivel,
    compras: [...new Set([...atual.compras, ...legado.compras])],
    gastos: Math.max(atual.gastos, legado.gastos),
    constelacoes: {
      ...Object.fromEntries(
        Object.entries(legado.constelacoes).filter(([id]) => NIVEIS.some((n) => n.constelacao === id)),
      ),
      ...atual.constelacoes,
    },
    desafios: {
      ...Object.fromEntries(Object.entries(legado.desafios).filter(([, id]) => missoes.has(id))),
      ...atual.desafios,
    },
    dias: [...new Set([...atual.dias, ...legado.dias])].sort(),
  };
}
