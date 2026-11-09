import { randomInt } from "node:crypto";
import { DIGITOS_CODIGO_ALUNO, LETRAS_CODIGO_ALUNO } from "@modolume/core";

/** Alfabeto do identificador legado de turma. */
export const ALFABETO_CODIGO_TURMA = LETRAS_CODIGO_ALUNO + DIGITOS_CODIGO_ALUNO;

/** Código pessoal novo: quatro letras e quatro dígitos, sem hífen no banco (ADR 0020). */
export function gerarCodigoAcesso() {
  const grupo = (alfabeto: string) => Array.from({ length: 4 }, () => alfabeto[randomInt(alfabeto.length)]).join("");
  return grupo(LETRAS_CODIGO_ALUNO) + grupo(DIGITOS_CODIGO_ALUNO);
}

/** PIN fácil demais de adivinhar: todos iguais (0000) ou em sequência (1234, 9876). */
export function pinFraco(pin: string) {
  const d = [...pin].map(Number);
  const iguais = d.every((n) => n === d[0]);
  const sobe = d.every((n, i) => i === 0 || n === d[i - 1]! + 1);
  const desce = d.every((n, i) => i === 0 || n === d[i - 1]! - 1);
  return iguais || sobe || desce;
}
