import "server-only";
import { cookies } from "next/headers";
import { COOKIE_SESSAO, DURACAO_SESSAO_S, assinarSessao, type PapelEquipe } from "./sessao";

/**
 * Grava o cookie de sessão (válido para todas as áreas do painel).
 * Fica fora dos arquivos "use server" de propósito: lá, toda função exportada
 * vira uma ação que o navegador pode chamar, e gravar sessão não pode ser uma.
 */
export async function gravarSessao(dados: {
  professorId: string;
  papel: PapelEquipe;
  trocarSenha: boolean;
  token?: string;
}) {
  const token = await assinarSessao({ ...dados, exp: Math.floor(Date.now() / 1000) + DURACAO_SESSAO_S });
  const jar = await cookies();
  jar.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_S,
  });
}
