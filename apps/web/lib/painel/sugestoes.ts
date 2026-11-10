/**
 * Sugestões do formulário de plano de aula, a partir do que o professor
 * escreveu no tema. Regras simples e explicáveis (comparação de palavras),
 * sem IA e sem enviar dados de alunos para fora.
 */

export interface AtividadeApp {
  id: string;
  titulo: string;
  formato: string;
  conteudo: string;
}

const PALAVRAS_VAZIAS = new Set(["para", "como", "com", "dos", "das", "nas", "nos", "uma", "dia", "entre", "sobre"]);

export const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Radicais das palavras (5 primeiras letras), ignorando as curtas e as vazias. */
function radicais(texto: string) {
  return new Set(
    normalizar(texto)
      .split(/[^a-z0-9]+/)
      .filter((p) => p.length >= 4 && !PALAVRAS_VAZIAS.has(p))
      .map((p) => p.slice(0, 5)),
  );
}

/** Palavras do tema que apontam para cada habilidade da BNCC do 6º ano. */
const PISTAS_BNCC: [string[], string][] = [
  [["reta", "compar", "orden"], "EF06MA01"],
  [["opera", "soma", "adica", "subtr", "multi", "divis"], "EF06MA03"],
  [["multi", "divis", "primo", "compo"], "EF06MA05"],
  [["fraca", "equiv"], "EF06MA07"],
  [["decim", "fraca"], "EF06MA08"],
  [["porce", "desco", "promo"], "EF06MA13"],
  [["perim", "area", "medid", "grand", "compr", "massa"], "EF06MA24"],
  [["angul", "trans", "giro"], "EF06MA27"],
];

export function sugerirHabilidades(tema: string): string[] {
  const r = radicais(tema);
  return PISTAS_BNCC.filter(([pistas]) => pistas.some((p) => r.has(p.slice(0, 5)))).map(([, c]) => c);
}

/** Atividades do app cujo conteúdo ou título tem palavras em comum com o tema. */
export function sugerirAtividades(tema: string, atividades: AtividadeApp[]): string[] {
  const r = radicais(tema);
  if (r.size === 0) return [];
  return atividades.filter((a) => [...radicais(`${a.conteudo} ${a.titulo}`)].some((p) => r.has(p))).map((a) => a.id);
}
