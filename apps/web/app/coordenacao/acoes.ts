"use server";

import { revalidatePath } from "next/cache";
import { acao, type ResultadoAcao } from "@/lib/escola/api";

/** Vínculos professor ↔ turma (a API confere o papel de coordenação e a escola). */

function atualizar(turmaId: string) {
  revalidatePath("/coordenacao/vinculos");
  revalidatePath(`/coordenacao/turmas/${turmaId}`);
  revalidatePath("/coordenacao/turmas");
  revalidatePath("/coordenacao");
}

export async function vincular(turmaId: string, _: ResultadoAcao | null, f: FormData): Promise<ResultadoAcao> {
  const professorId = String(f.get("professorId") ?? "");
  if (!professorId) return { ok: false, erro: "Escolha o professor." };
  const r = await acao(`/coordenacao/turmas/${encodeURIComponent(turmaId)}/professores`, {
    metodo: "POST",
    corpo: { professorId },
  });
  if (!r.ok) return { ok: false, erro: r.erro };
  atualizar(turmaId);
  return { ok: true, mensagem: "Professor vinculado. A turma já aparece no painel dele." };
}

export async function desvincular(
  turmaId: string,
  professorId: string,
  _: ResultadoAcao | null,
): Promise<ResultadoAcao> {
  const r = await acao(
    `/coordenacao/turmas/${encodeURIComponent(turmaId)}/professores/${encodeURIComponent(professorId)}`,
    { metodo: "DELETE" },
  );
  if (!r.ok) return { ok: false, erro: r.erro };
  atualizar(turmaId);
  return { ok: true, mensagem: "Professor tirado da turma. O histórico da turma continua." };
}
