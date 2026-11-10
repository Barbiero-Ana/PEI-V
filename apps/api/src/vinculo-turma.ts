import { BadRequestException, NotFoundException } from "@nestjs/common";
import type { Prisma, Segmento } from "@prisma/client";

/** Serializa mudanças no quadro de professores com mudanças na turma. */
export async function turmaParaVinculo(
  tx: Prisma.TransactionClient,
  id: string,
  instituicaoId: string,
  segmento?: Segmento,
) {
  const linhas = await tx.$queryRaw<{ nome: string; ativa: boolean; segmento: Segmento | null }[]>`
    SELECT nome, ativa, segmento::text FROM turma
    WHERE id = ${id} AND instituicao_id = ${instituicaoId}
      AND (${segmento ?? null}::text IS NULL OR segmento::text = ${segmento ?? null})
    FOR UPDATE
  `;
  const turma = linhas[0];
  if (!turma) throw new NotFoundException("Turma não encontrada.");
  return turma;
}

/** Quem já está vinculado conserva o vínculo. O primeiro assume a responsabilidade. */
export async function incluirProfessor(tx: Prisma.TransactionClient, turmaId: string, professorId: string) {
  const existentes = await tx.professorTurma.count({ where: { turmaId } });
  const { count } = await tx.professorTurma.createMany({
    data: { professorId, turmaId, responsavel: existentes === 0 },
    skipDuplicates: true,
  });
  return count > 0;
}

export function conferirTurmaAtiva(turma: { ativa: boolean }) {
  if (!turma.ativa) throw new BadRequestException("Esta turma está encerrada.");
}
