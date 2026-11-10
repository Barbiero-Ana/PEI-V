import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_SESSAO,
  expirarCookiesSessao,
  INICIO_DO_PAPEL,
  lerSessao,
  papelDa,
  type PapelEquipe,
} from "@/lib/painel/sessao";

/**
 * Protege as áreas do painel. O login (/entrar) é um portal só para toda a equipe. Sem sessão válida, qualquer página leva ao login.
 * Com sessão, cada papel só abre a sua área: professor em /professor,
 * coordenação em /coordenacao e administrador em /admin (a API confere de novo
 * em cada chamada). Quem entrou com senha provisória troca a senha antes.
 */

const AREA_DO_CAMINHO: [string, PapelEquipe][] = [
  ["/professor", "professor"],
  ["/coordenacao", "coordenacao"],
  ["/admin", "admin"],
];

const LOGIN = "/entrar";
const TROCAR_SENHA = "/conta/senha";
const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

function irPara(req: NextRequest, caminho: string) {
  const destino = new URL(caminho, req.url);
  const host = req.headers.get("host");
  // No servidor local, localhost e 127.0.0.1 têm cookies separados.
  if (host && LOOPBACK.test(host) && LOOPBACK.test(destino.host)) destino.host = host;
  return NextResponse.redirect(destino);
}

export async function middleware(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  const sessao = await lerSessao(req.cookies.get(COOKIE_SESSAO)?.value);
  const noLogin = caminho === LOGIN;

  // a API recusou o token (vencido ou de outro servidor): apaga a sessão e mostra o login
  if (noLogin && req.nextUrl.searchParams.has("expirou")) {
    const resposta = irPara(req, LOGIN);
    expirarCookiesSessao(resposta.headers);
    return resposta;
  }
  if (!sessao) return noLogin ? NextResponse.next() : irPara(req, LOGIN);

  const papel = papelDa(sessao);
  const inicio = INICIO_DO_PAPEL[papel];
  if (noLogin) return irPara(req, sessao.trocarSenha ? TROCAR_SENHA : inicio);

  // senha provisória: só a página de troca abre
  if (sessao.trocarSenha && caminho !== TROCAR_SENHA) return irPara(req, TROCAR_SENHA);

  const area = AREA_DO_CAMINHO.find(([base]) => caminho === base || caminho.startsWith(`${base}/`));
  if (area && area[1] !== papel) return irPara(req, inicio);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/entrar",
    "/professor",
    "/professor/:caminho*",
    "/coordenacao",
    "/coordenacao/:caminho*",
    "/admin",
    "/admin/:caminho*",
    "/conta/:caminho*",
  ],
};
