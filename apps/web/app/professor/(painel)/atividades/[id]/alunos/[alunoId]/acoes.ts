"use server";
import { revalidatePath } from "next/cache";
import { esquemaAvaliacao } from "@modolume/core";
import { chamarApi, ErroApi } from "@/lib/painel/api";
import { professorLogado, tokenDaApi } from "@/lib/painel/dados";

export async function salvarAvaliacao(
  atividadeId: string,
  alunoId: string,
  _estado: { erro: string; sucesso: string },
  form: FormData,
) {
  await professorLogado();
  const lido = esquemaAvaliacao.safeParse({
    id: form.get("id"),
    jogadaId: form.get("jogadaId"),
    feedback: form.get("feedback"),
    percepcao: form.get("percepcao") || null,
    publicar: form.get("publicar") === "sim",
  });
  if (!lido.success) return { erro: lido.error.issues[0]!.message, sucesso: "" };
  try {
    await chamarApi(
      `/professor/atividades/${encodeURIComponent(atividadeId)}/alunos/${encodeURIComponent(alunoId)}/avaliacoes`,
      { token: await tokenDaApi(), metodo: "POST", corpo: lido.data },
    );
  } catch (erro) {
    if (erro instanceof ErroApi) return { erro: erro.message, sucesso: "" };
    throw erro;
  }
  revalidatePath("/professor", "layout");
  return {
    erro: "",
    sucesso: lido.data.publicar
      ? "Avaliação publicada. O aluno verá sua orientação e um aviso no app."
      : "Rascunho salvo. Somente você pode vê-lo.",
  };
}
