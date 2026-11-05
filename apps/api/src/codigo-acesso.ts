import { randomInt } from "node:crypto";

/**
 * Código pessoal de acesso do aluno (ADR 0017): 8 caracteres de um alfabeto sem
 * O, 0, I, 1 e L, que se confundem quando o professor dita ou imprime o código.
 * 31^8 ≈ 850 bilhões de combinações: inviável de adivinhar com o limite de
 * tentativas da API. Mostrado como "ABCD-EFGH"; guardado sem o traço.
 */
export const ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function gerarCodigoAcesso() {
  let codigo = "";
  for (let i = 0; i < 8; i++) codigo += ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)];
  return codigo;
}

/** "abcd-efgh", "ABCD EFGH" → "ABCDEFGH" (aceita o código como o aluno digitar). */
export const normalizarCodigo = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** PIN fácil demais de adivinhar: todos iguais (0000) ou em sequência (1234, 9876). */
export function pinFraco(pin: string) {
  const d = [...pin].map(Number);
  const iguais = d.every((n) => n === d[0]);
  const sobe = d.every((n, i) => i === 0 || n === d[i - 1]! + 1);
  const desce = d.every((n, i) => i === 0 || n === d[i - 1]! - 1);
  return iguais || sobe || desce;
}
