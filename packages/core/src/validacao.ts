import { z } from "zod";

/** Datas civis: recusa normalizações silenciosas como 31 de fevereiro. */
export const esquemaData = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.")
  .refine((valor) => {
    const data = new Date(`${valor}T00:00:00.000Z`);
    return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor;
  }, "Informe uma data válida.");

export const normalizarBusca = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

/** Página inteira, limitada antes de calcular o deslocamento no banco. */
export function numeroDaPagina(valor: unknown, limite = 1000): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.max(1, Math.min(limite, Math.floor(numero))) : 1;
}
