import "server-only";

/**
 * Chamadas do painel à API do Modolume (apps/api). Só o servidor do painel fala
 * com a API: o token do professor fica no cookie de sessão (httpOnly) e nunca
 * vai para o navegador.
 *
 * Sem API_URL no ambiente, o painel usa os dados de demonstração do núcleo.
 */

export const API_URL = process.env.API_URL?.replace(/\/$/, "") ?? "";
export const usandoApi = () => API_URL !== "";

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly erros: { campo: string; mensagem: string }[] = [],
  ) {
    super(mensagem);
  }
}

export async function chamarApi<T>(
  caminho: string,
  opcoes: { token?: string; metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; corpo?: unknown } = {},
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: opcoes.metodo ?? "GET",
      headers: {
        ...(opcoes.corpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}),
      },
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ErroApi(503, "Não foi possível falar com o servidor do Modolume. Tente de novo em instantes.");
  }
  const dados = (await resposta.json().catch(() => ({}))) as {
    message?: string | { mensagem?: string; erros?: ErroApi["erros"] };
    mensagem?: string;
    erros?: ErroApi["erros"];
  };
  if (!resposta.ok) {
    const corpo = typeof dados.message === "object" ? dados.message : dados;
    const mensagem = typeof dados.message === "string" ? dados.message : (corpo.mensagem ?? "Erro no servidor.");
    throw new ErroApi(resposta.status, mensagem, corpo.erros ?? []);
  }
  return dados as T;
}
