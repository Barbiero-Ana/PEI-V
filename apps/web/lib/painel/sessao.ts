/**
 * Sessão da equipe (professor, coordenação ou administrador): um cookie com o id do professor e a validade, assinado
 * com HMAC-SHA256. Usa só Web Crypto, então funciona no middleware e no
 * servidor. Com a API ligada, o cookie também guarda o token da API do
 * professor (o navegador não consegue ler: o cookie é httpOnly).
 */

export const COOKIE_SESSAO = "modolume_sessao";

export function expirarCookiesSessao(headers: Headers) {
  // Sessões antigas usavam /professor. O Next guarda só um cookie por nome na API de cookies.
  for (const caminho of ["/", "/professor"]) {
    headers.append("Set-Cookie", `${COOKIE_SESSAO}=; Path=${caminho}; Max-Age=0; HttpOnly; SameSite=Lax`);
  }
}
/** Validade da sessão: 8 horas (um turno de trabalho). */
export const DURACAO_SESSAO_S = 8 * 60 * 60;

/** Papel da pessoa da equipe: define a área do painel que ela abre. */
export type PapelEquipe = "professor" | "coordenacao" | "admin";

/** Página inicial de cada papel. */
export const INICIO_DO_PAPEL: Record<PapelEquipe, string> = {
  professor: "/professor",
  coordenacao: "/coordenacao",
  admin: "/admin",
};

/** Sessões antigas (antes dos papéis) eram sempre de professor. */
export const papelDa = (s: Pick<Sessao, "papel">): PapelEquipe => s.papel ?? "professor";

export interface Sessao {
  /** Id da pessoa da equipe (o nome ficou por compatibilidade com as sessões antigas). */
  professorId: string;
  papel?: PapelEquipe;
  /** Senha provisória: precisa trocar antes de usar o painel. */
  trocarSenha?: boolean;
  /** Expira em (epoch, segundos). */
  exp: number;
  /** Token da API do Modolume (quando o painel usa a API). */
  token?: string;
}

function segredo(): string {
  const s = process.env.SESSAO_SEGREDO;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Defina SESSAO_SEGREDO no ambiente.");
  return "dev-modolume-trocar-em-producao";
}

const codificador = new TextEncoder();

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const deBase64url = (texto: string) => {
  const b64 = texto.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function chave() {
  return crypto.subtle.importKey("raw", codificador.encode(segredo()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function assinarSessao(sessao: Sessao): Promise<string> {
  const corpo = base64url(codificador.encode(JSON.stringify(sessao)));
  const assinatura = await crypto.subtle.sign("HMAC", await chave(), codificador.encode(corpo));
  return `${corpo}.${base64url(new Uint8Array(assinatura))}`;
}

/** Devolve a sessão se a assinatura for válida e não tiver expirado; senão, null. */
export async function lerSessao(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null;
  const [corpo, assinatura] = token.split(".");
  if (!corpo || !assinatura) return null;
  try {
    const valida = await crypto.subtle.verify(
      "HMAC",
      await chave(),
      deBase64url(assinatura),
      codificador.encode(corpo),
    );
    if (!valida) return null;
    const sessao = JSON.parse(new TextDecoder().decode(deBase64url(corpo))) as Sessao;
    if (
      typeof sessao.professorId !== "string" ||
      !sessao.professorId ||
      !Number.isFinite(sessao.exp) ||
      sessao.exp * 1000 <= Date.now()
    )
      return null;
    if (sessao.papel !== undefined && !["professor", "coordenacao", "admin"].includes(sessao.papel)) return null;
    return sessao;
  } catch {
    return null;
  }
}
