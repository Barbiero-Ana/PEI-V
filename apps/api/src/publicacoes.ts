import { randomUUID } from "node:crypto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { esquemaAtividade, esquemaAtividadeParaEnvio, conteudoDaPublicacao, type DadosAtividade } from "@modolume/core";
import type { Prisma } from "@prisma/client";
import { atividadeDoBanco, dataDoBanco, dataIso, incluirAtividade } from "./conversao.js";
import { hojeBrasil, validar } from "./infra.js";
import { referenciaDaJogadaValida, type JogadaRecebida } from "./jogada.js";

type BancoPublicacao = Pick<Prisma.TransactionClient, "atividadePublicacao">;

/** Deve executar dentro da transação e com a linha da atividade bloqueada. */
export async function publicarAtividade(tx: Prisma.TransactionClient, id: string) {
  const atividade = await tx.atividadeProfessor.findUnique({ where: { id }, include: incluirAtividade });
  if (!atividade || atividade.arquivada) throw new NotFoundException("Atividade não encontrada.");
  const ultima = await tx.atividadePublicacao.findFirst({ where: { atividadeId: id }, orderBy: { numero: "desc" } });
  if (atividade.status === "enviada" && ultima) return atividade;
  const dados = validar(esquemaAtividadeParaEnvio, atividadeDoBanco(atividade));
  await tx.atividadePublicacao.create({
    data: {
      id: randomUUID(),
      atividadeId: id,
      numero: (ultima?.numero ?? 0) + 1,
      conteudo: JSON.parse(JSON.stringify(dados)) as Prisma.InputJsonValue,
      turmas: dados.turmas,
      liberarEm: dataDoBanco(dados.liberarEm),
      prazo: dados.prazo ? dataDoBanco(dados.prazo) : null,
    },
  });
  return tx.atividadeProfessor.update({
    where: { id },
    data: { status: "enviada", enviadaEm: new Date() },
    include: incluirAtividade,
  });
}

/** O estado atual do rascunho não altera a referência de uma resposta offline. */
export async function publicacaoDoResultado(
  tx: BancoPublicacao,
  j: JogadaRecebida,
  turmaId: string,
  missao: { formatoId: string } | undefined,
) {
  if (!j.publicacaoId || !j.atividadeId || j.data > hojeBrasil()) return null;
  const p = await tx.atividadePublicacao.findUnique({ where: { id: j.publicacaoId } });
  if (!p || p.atividadeId !== j.atividadeId || !Array.isArray(p.turmas) || !p.turmas.includes(turmaId)) return null;
  const lida = esquemaAtividade.safeParse(p.conteudo);
  if (!lida.success || j.data < dataIso(p.liberarEm) || (p.prazo && j.data > dataIso(p.prazo))) return null;
  const dados = lida.data;
  if (!referenciaDaJogadaValida(j, missao, { formato: dados.formato, missaoId: dados.missaoId || null })) return null;
  if (dados.formato !== "pronta" && j.rodadas !== dados.questoes.length) return null;
  return { publicacao: p, dados };
}

export function exigirConteudoPreservado(atual: DadosAtividade, novo: DadosAtividade) {
  if (conteudoDaPublicacao(atual) !== conteudoDaPublicacao(novo))
    throw new BadRequestException(
      "A atividade publicada permite alterar apenas o prazo. Recolha para editar e publique uma nova versão.",
    );
}
