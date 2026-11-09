"use server";

import { redirect } from "next/navigation";
import { acao } from "@/lib/escola/api";
import { cookies } from "next/headers";
import { COOKIE_SESSAO } from "@/lib/painel/sessao";

export interface EstadoSenha {
  erro: string | null;
}

/** Troca a própria senha (a API confere a atual) e libera o painel. */
export async function trocarSenha(_: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const atual = String(form.get("atual") ?? "");
  const nova = String(form.get("nova") ?? "");
  const confirma = String(form.get("confirma") ?? "");
  if (!atual || !nova) return { erro: "Preencha a senha atual e a nova." };
  if (nova !== confirma) return { erro: "A confirmação não é igual à nova senha." };
  const r = await acao("/auth/senha", { metodo: "POST", corpo: { atual, nova } });
  if (!r.ok) return { erro: r.erro };
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/entrar?senha=trocada");
}
