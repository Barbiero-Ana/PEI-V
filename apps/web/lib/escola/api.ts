import "server-only";
import { cache } from "react";
import type { Segmento } from "@modolume/core";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, chamarApi, usandoApi } from "@/lib/painel/api";
import { COOKIE_SESSAO, INICIO_DO_PAPEL, lerSessao, papelDa, type PapelEquipe } from "@/lib/painel/sessao";

/**
 * Chamadas das áreas da coordenação e do administrador à API. Só o servidor do
 * painel fala com a API; o token fica no cookie de sessão (httpOnly). Sessão
 * vencida ou recusada leva de volta ao login.
 */

export const sessaoDaEquipe = cache(async () => lerSessao((await cookies()).get(COOKIE_SESSAO)?.value));

export async function apiDaEquipe<T>(
  caminho: string,
  opcoes: { metodo?: "GET" | "POST" | "PUT" | "DELETE"; corpo?: unknown } = {},
): Promise<T> {
  const sessao = await sessaoDaEquipe();
  if (!sessao?.token || !usandoApi()) redirect("/entrar?expirou=1");
  try {
    return await chamarApi<T>(caminho, { ...opcoes, token: sessao.token });
  } catch (e) {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar?expirou=1");
    // papel mudou enquanto a pessoa estava logada: leva para a área certa
    if (e instanceof ErroApi && e.status === 403) redirect(INICIO_DO_PAPEL[papelDa(sessao)]);
    throw e;
  }
}

export interface Eu {
  id: string;
  nome: string;
  email: string;
  papel: PapelEquipe;
  disciplina: string | null;
  segmento: Segmento | null;
  senhaProvisoria: boolean;
  instituicao: { id: string; nome: string };
}

/** Quem está logado (nome, papel e escola), uma vez por requisição. */
export const euLogado = cache(() => apiDaEquipe<Eu>("/auth/eu"));

/** Resultado padrão das ações (formulários): ok ou a mensagem de erro já em português. */
export type ResultadoAcao = { ok: true; mensagem?: string; codigo?: string } | { ok: false; erro: string };

/** Executa a chamada de uma ação e devolve a mensagem de erro da API, em vez de quebrar a página. */
export async function acao(
  caminho: string,
  opcoes: { metodo?: "POST" | "PUT" | "DELETE"; corpo?: unknown },
): Promise<{ ok: true; dados: Record<string, unknown> } | { ok: false; erro: string }> {
  try {
    const dados = await apiDaEquipe<Record<string, unknown>>(caminho, opcoes);
    return { ok: true, dados };
  } catch (e) {
    if (e instanceof ErroApi) {
      const detalhe = e.erros[0]?.mensagem;
      return { ok: false, erro: detalhe ?? e.message };
    }
    // redirect() do Next lança um erro especial: precisa seguir adiante
    throw e;
  }
}

export const NOME_DO_PAPEL: Record<PapelEquipe, string> = {
  professor: "Professor",
  coordenacao: "Coordenação",
  admin: "Administrador",
};
