"use server";

import { revalidatePath } from "next/cache";
import { ErroApi, chamarApi, usandoApi } from "@/lib/painel/api";
import { tokenDaApi } from "@/lib/painel/dados";

/**
 * Acesso do aluno ao app (ADR 0017). O professor ou a coordenação repassa o
 * código pessoal; quando o aluno esquece o PIN, o professor zera; se o código
 * vazou ou o celular foi perdido, gera um código novo (o antigo para de valer e
 * o aluno sai do app em todos os aparelhos). A API confere se o aluno é de uma
 * turma do professor.
 */

export interface ResultadoAcesso {
  ok: boolean;
  mensagem: string;
}

async function acao(alunoId: string, caminho: "zerar-pin" | "novo-codigo", sucesso: string): Promise<ResultadoAcesso> {
  if (!usandoApi()) return { ok: false, mensagem: "Disponível só com o servidor ligado." };
  try {
    await chamarApi(`/professor/alunos/${encodeURIComponent(alunoId)}/${caminho}`, {
      metodo: "POST",
      token: await tokenDaApi(),
    });
  } catch (e) {
    return { ok: false, mensagem: e instanceof ErroApi ? e.message : "Não deu certo agora. Tente de novo." };
  }
  revalidatePath(`/professor/alunos/${alunoId}`);
  return { ok: true, mensagem: sucesso };
}

export async function zerarPinDoAluno(alunoId: string) {
  return acao(alunoId, "zerar-pin", "PIN zerado. No próximo acesso, o aluno cria um novo.");
}

export async function novoCodigoDoAluno(alunoId: string) {
  return acao(alunoId, "novo-codigo", "Código novo gerado. O código antigo não funciona mais.");
}
