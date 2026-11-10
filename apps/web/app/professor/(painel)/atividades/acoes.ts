"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { listaDeTurmas, professorLogado } from "@/lib/painel/dados";
import { esquemaAtividade, esquemaAtividadeParaEnvio } from "@modolume/core";
import { buscarAtividade, excluirAtividade, mudarEnvio, salvarAtividade } from "@/lib/painel/atividades";
import { ErroApi } from "@/lib/painel/api";
import { buscarPlano } from "@/lib/painel/planejamento";

export interface EstadoAtividade {
  /** Mensagens por campo ("titulo", "turmas", "questoes.0"...). */
  erros: Record<string, string>;
  tentativa: number;
}

/**
 * Salva a atividade montada no editor. Os dados vêm como JSON num campo
 * oculto (o editor tem listas de questões que não cabem em campos simples);
 * "enviar" decide se ela já vai para o app ou fica como rascunho.
 */
export async function gravarAtividade(anterior: EstadoAtividade, form: FormData): Promise<EstadoAtividade> {
  const professor = await professorLogado();
  const id = String(form.get("id") ?? "") || undefined;
  const enviar = form.get("enviar") === "sim";

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(form.get("dados") ?? "{}"));
  } catch {
    return { erros: { geral: "Não foi possível ler a atividade. Tente de novo." }, tentativa: anterior.tentativa + 1 };
  }
  const publicada = id && !enviar && (await buscarAtividade(professor, id))?.status === "enviada";
  const lido = (enviar || publicada ? esquemaAtividadeParaEnvio : esquemaAtividade).safeParse(bruto);
  const erros: Record<string, string> = {};
  if (!lido.success) for (const e of lido.error.issues) erros[e.path.join(".") || "geral"] ??= e.message;

  if (lido.success) {
    // só turmas e planos do próprio professor
    const minhas = new Set((await listaDeTurmas(professor)).map((t) => t.turma.id));
    if (lido.data.turmas.some((t) => !minhas.has(t))) erros.turmas = "Escolha apenas turmas suas.";
    if (lido.data.planoId && !(await buscarPlano(professor, lido.data.planoId)))
      erros.planoId = "Plano não encontrado.";
  }
  if (!lido.success || Object.keys(erros).length > 0) return { erros, tentativa: anterior.tentativa + 1 };

  let atividade;
  try {
    atividade = await salvarAtividade(professor, lido.data, id);
    if (atividade && enviar) await mudarEnvio(professor, atividade.id, true);
  } catch (erro) {
    if (!(erro instanceof ErroApi)) throw erro;
    for (const campo of erro.erros) erros[campo.campo] ??= campo.mensagem;
    if (Object.keys(erros).length === 0) erros.geral = erro.message;
    return { erros, tentativa: anterior.tentativa + 1 };
  }
  if (!atividade) redirect("/professor/atividades");
  revalidatePath("/professor", "layout");
  redirect(`/professor/atividades/${atividade.id}`);
}

export async function enviarAtividade(id: string) {
  const professor = await professorLogado();
  const atividade = await buscarAtividade(professor, id);
  if (!atividade) redirect("/professor/atividades");
  if (!esquemaAtividadeParaEnvio.safeParse(atividade).success) redirect(`/professor/atividades/${id}/editar`);
  try {
    await mudarEnvio(professor, id, true);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 400) redirect(`/professor/atividades/${id}/editar`);
    throw erro;
  }
  revalidatePath("/professor", "layout");
}

export async function voltarParaRascunho(id: string) {
  const professor = await professorLogado();
  await mudarEnvio(professor, id, false);
  revalidatePath("/professor", "layout");
}

export async function apagarAtividade(id: string) {
  const professor = await professorLogado();
  await excluirAtividade(professor, id);
  revalidatePath("/professor", "layout");
  redirect("/professor/atividades");
}
