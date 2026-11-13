"use server";
import { revalidatePath } from "next/cache";
import { chamarApi, ErroApi, usandoApi } from "@/lib/painel/api";
import { esquemaAtividade } from "@modolume/core";
import { buscarAtividade, salvarAtividade } from "@/lib/painel/atividades";
import { professorLogado, tokenDaApi } from "@/lib/painel/dados";

export async function alterarPrazo(id: string, _estado: { erro: string; sucesso: string }, form: FormData) {
  const professor = await professorLogado();
  try {
    if (usandoApi())
      await chamarApi(`/professor/atividades/${encodeURIComponent(id)}/prazo`, {
        token: await tokenDaApi(),
        metodo: "PATCH",
        corpo: { prazo: String(form.get("prazo") ?? "") },
      });
    else {
      const atual = await buscarAtividade(professor, id);
      const lido = esquemaAtividade.safeParse({ ...atual, prazo: String(form.get("prazo") ?? "") });
      if (!atual) throw new ErroApi(404, "Atividade não encontrada.");
      if (!lido.success) throw new ErroApi(400, lido.error.issues[0]!.message);
      await salvarAtividade(professor, lido.data, id);
    }
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message, sucesso: "" };
    throw erro;
  }
  revalidatePath("/professor", "layout");
  return { erro: "", sucesso: "Prazo atualizado. O conteúdo publicado foi preservado." };
}
