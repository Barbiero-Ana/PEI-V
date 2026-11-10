import { expirarCookiesSessao } from "@/lib/painel/sessao";

export function POST(req: Request) {
  const origem = req.headers.get("origin");
  const contexto = req.headers.get("sec-fetch-site");
  if (!origem || !URL.canParse(origem) || new URL(origem).host !== req.headers.get("host")) {
    return new Response(null, { status: 403 });
  }
  if (contexto && contexto !== "same-origin") return new Response(null, { status: 403 });

  const headers = new Headers({ Location: "/entrar" });
  expirarCookiesSessao(headers);
  return new Response(null, { status: 303, headers });
}
