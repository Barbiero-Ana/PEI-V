import Constants from "expo-constants";
import { NativeModules } from "react-native";

/**
 * Chamadas do app à API do Modolume (apps/api). O endereço vem de
 * EXPO_PUBLIC_API_URL (arquivo apps/mobile/.env.local):
 * - "auto" (desenvolvimento): a API no mesmo computador que serve o app (o
 *   Metro), na porta 3333. Assim, quando o IP do computador muda na rede Wi-Fi,
 *   o app continua achando a API sem editar nada;
 * - um endereço completo: publicado, o do Railway.
 * Sem ele, o app funciona só no aparelho, como antes.
 */
function enderecoDaApi() {
  const configurado = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();
  if (configurado !== "auto") return configurado.replace(/\/$/, "");
  const computador = Constants.expoConfig?.hostUri?.split(":")[0] ?? hostDoMetro();
  return computador ? `http://${computador}:3333` : "";
}

/**
 * Endereço de onde o app baixou o código (o Metro). No app de desenvolvimento
 * instalado (expo run:android), o hostUri vem vazio; o endereço está aqui. No
 * emulador Android, é 10.0.2.2 (o computador visto de dentro do emulador).
 */
function hostDoMetro() {
  const fonte = NativeModules.SourceCode as { getConstants?: () => { scriptURL?: string } } | undefined;
  const url = fonte?.getConstants?.().scriptURL;
  return url?.match(/^https?:\/\/([^:/]+)/)?.[1];
}

export const API_URL = enderecoDaApi();
export const temApi = API_URL !== "";

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

/** Sem internet ou servidor fora do ar: o app guarda e tenta de novo depois. */
export const semConexao = (e: unknown) => e instanceof ErroApi && e.status === 0;

export async function chamarApi<T>(
  caminho: string,
  opcoes: { token?: string; metodo?: "GET" | "POST" | "PUT" | "PATCH"; corpo?: unknown; tempoLimite?: number } = {},
): Promise<T> {
  if (!temApi) throw new ErroApi(0, "O app está sem servidor configurado.");
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), opcoes.tempoLimite ?? 12_000);
  try {
    const resposta = await fetch(`${API_URL}${caminho}`, {
      method: opcoes.metodo ?? "GET",
      headers: {
        ...(opcoes.corpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opcoes.token ? { Authorization: `Bearer ${opcoes.token}` } : {}),
      },
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
      signal: controle.signal,
    });
    const dados: unknown = await resposta.json().catch(() => null);
    if (controle.signal.aborted) throw new Error("Tempo limite de resposta.");
    const corpo = dados && typeof dados === "object" ? (dados as { message?: unknown; mensagem?: unknown }) : null;
    if (!resposta.ok) {
      const mensagem = typeof corpo?.message === "string" ? corpo.message : corpo?.mensagem;
      throw new ErroApi(resposta.status, typeof mensagem === "string" ? mensagem : "Algo deu errado. Tente de novo.");
    }
    if (!corpo || Array.isArray(dados)) {
      throw new ErroApi(502, "O servidor enviou uma resposta inválida. Tente novamente.");
    }
    return dados as T;
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;
    throw new ErroApi(0, "Sem conexão com o servidor. Confira a internet e tente de novo.");
  } finally {
    clearTimeout(relogio);
  }
}
