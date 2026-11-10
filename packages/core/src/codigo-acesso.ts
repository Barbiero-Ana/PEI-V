export const LETRAS_CODIGO_ALUNO = "ABCDEFGHJKMNPQRSTUVWXYZ";
export const DIGITOS_CODIGO_ALUNO = "23456789";

// A leitura aceita também os códigos mistos já distribuídos (ADR 0020).
const formatoAceito = new RegExp(`^[${LETRAS_CODIGO_ALUNO}${DIGITOS_CODIGO_ALUNO}]{8}$`);

export const normalizarCodigoAcesso = (texto: string) =>
  texto.replace(/[a-z]/g, (letra) => letra.toUpperCase()).replace(/[\s-]/g, "");

export const codigoAcessoValido = (codigo: string) => formatoAceito.test(codigo);

export function formatarCodigoAcesso(texto: string) {
  const codigo = normalizarCodigoAcesso(texto);
  return codigo.length > 4 ? `${codigo.slice(0, 4)}-${codigo.slice(4)}` : codigo;
}
