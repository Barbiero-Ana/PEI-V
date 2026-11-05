import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, INICIO_DO_PAPEL, lerSessao, papelDa, type PapelEquipe } from "@/lib/painel/sessao";

/**
 * Protege as áreas do painel. Sem sessão válida, qualquer página leva ao login.
 * Com sessão, cada papel só abre a sua área: professor em /professor,
 * coordenação em /coordenacao e administrador em /admin (a API confere de novo
 * em cada chamada). Quem entrou com senha provisória troca a senha antes.
 */

const AREA_DO_CAMINHO: [string, PapelEquipe][] = [
  ["/professor", "professor"],
  ["/coordenacao", "coordenacao"],
  ["/admin", "admin"],
];

const LOGIN = "/professor/entrar";
const TROCAR_SENHA = "/conta/senha";

export async function middleware(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  const sessao = await lerSessao(req.cookies.get(COOKIE_SESSAO)?.value);
  const noLogin = caminho === LOGIN;

  // a API recusou o token (vencido ou de outro servidor): apaga a sessão e mostra o login
  if (noLogin && req.nextUrl.searchParams.has("expirou")) {
    const resposta = NextResponse.next();
    resposta.cookies.delete({ name: COOKIE_SESSAO, path: "/" });
    resposta.cookies.delete({ name: COOKIE_SESSAO, path: "/professor" });
    return resposta;
  }
  if (!sessao) return noLogin ? NextResponse.next() : NextResponse.redirect(new URL(LOGIN, req.url));

  const papel = papelDa(sessao);
  const inicio = INICIO_DO_PAPEL[papel];
  if (noLogin) return NextResponse.redirect(new URL(sessao.trocarSenha ? TROCAR_SENHA : inicio, req.url));

  // senha provisória: só a página de troca abre
  if (sessao.trocarSenha && caminho !== TROCAR_SENHA) return NextResponse.redirect(new URL(TROCAR_SENHA, req.url));

  const area = AREA_DO_CAMINHO.find(([base]) => caminho === base || caminho.startsWith(`${base}/`));
  if (area && area[1] !== papel) return NextResponse.redirect(new URL(inicio, req.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/professor",
    "/professor/:caminho*",
    "/coordenacao",
    "/coordenacao/:caminho*",
    "/admin",
    "/admin/:caminho*",
    "/conta/:caminho*",
  ],
};
