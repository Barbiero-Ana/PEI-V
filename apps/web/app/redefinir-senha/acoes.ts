"use server";

import { ErroApi, chamarApi } from "@/lib/painel/api";

export async function recuperarAcesso(_: { mensagem: string; erro?: boolean }, dados: FormData) {
  try {
    const token = String(dados.get("token") ?? "");
    if (token) {
      const nova = String(dados.get("nova") ?? "");
      if (nova !== String(dados.get("confirmacao") ?? "")) return { mensagem: "As senhas não coincidem.", erro: true };
      await chamarApi("/auth/redefinir-senha", { metodo: "POST", corpo: { token, nova } });
      return { mensagem: "Senha definida. Entre novamente com sua nova senha." };
    }
    const resposta = await chamarApi<{ mensagem: string }>("/auth/recuperar-senha", {
      metodo: "POST",
      corpo: { email: String(dados.get("email") ?? "") },
    });
    return { mensagem: resposta.mensagem };
  } catch (erro) {
    return {
      mensagem:
        erro instanceof ErroApi
          ? (erro.erros[0]?.mensagem ?? erro.message)
          : "Não foi possível concluir. Tente novamente.",
      erro: true,
    };
  }
}
