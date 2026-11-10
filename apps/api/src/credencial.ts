import { createHash, randomBytes } from "node:crypto";
import { ServiceUnavailableException } from "@nestjs/common";
import { z } from "zod";

/** bcrypt limita entradas a 72 bytes, não a 72 caracteres Unicode. */
export const senhaNova = z
  .string()
  .min(8, "A senha precisa de pelo menos 8 caracteres.")
  .refine((senha) => Buffer.byteLength(senha, "utf8") <= 72, "A senha pode ocupar até 72 bytes.")
  .refine((senha) => /[A-Za-z]/.test(senha) && /\d/.test(senha), "Use letras e números na senha.");

export const gerarSegredo = () => randomBytes(32).toString("hex");
export const resumoDoSegredo = (segredo: string) => createHash("sha256").update(segredo).digest("hex");
export const MENSAGEM_RECUPERACAO =
  "Se houver uma conta ativa para este e-mail, você receberá as instruções de redefinição.";
export function configuracaoRecuperacao() {
  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;
  const origem = process.env.WEB_URL;
  const minutos = Number(process.env.REDEFINICAO_MINUTOS ?? 30);
  if (!chave || !remetente || !origem || !Number.isInteger(minutos) || minutos < 5 || minutos > 60)
    throw new ServiceUnavailableException("A recuperação por e-mail ainda não está disponível. Fale com a escola.");
  if (process.env.NODE_ENV === "production" && !origem.startsWith("https://"))
    throw new ServiceUnavailableException("A recuperação de acesso está temporariamente indisponível.");
  return { chave, remetente, origem, minutos };
}

/** Adaptador para o serviço de e-mail da instituição. Nunca devolve o link ao solicitante. */
export async function entregarRedefinicao(email: string, segredo: string): Promise<void> {
  const { chave, remetente, origem, minutos } = configuracaoRecuperacao();
  const link = new URL("/redefinir-senha", origem);
  // Fragmento não é enviado em logs HTTP nem no Referer; o formulário o lê no navegador.
  link.hash = segredo;
  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${chave}` },
      body: JSON.stringify({
        from: remetente,
        to: [email],
        subject: "Redefinir acesso ao Modolume",
        text: `Defina sua senha em ${link.toString()}\nEste link vale por ${minutos} minutos e só pode ser usado uma vez. Se não foi você, ignore esta mensagem.`,
      }),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });
    if (!resposta.ok) throw new Error("Entrega recusada");
  } catch {
    throw new ServiceUnavailableException("A recuperação de acesso está temporariamente indisponível.");
  }
}
