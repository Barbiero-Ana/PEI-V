import { StyleSheet } from "react-native";
import { lerPrefs } from "@/lib/acessibilidadeSalva";

/**
 * Identidade Modolume: cores sólidas, sem gradientes.
 *
 * Há duas paletas com os mesmos nomes. A de alto contraste escurece textos,
 * bordas e cores de destaque (contraste de pelo menos 4,5:1 sobre o branco)
 * e deixa os fundos quase brancos. `cor` sempre lê a paleta ativa; estilos e tabelas
 * de cores feitos com `criarEstilos`/`porTema` são refeitos quando ela muda,
 * então trocar o contraste não reinicia o app.
 */

const PADRAO = {
  fundo: "#F7F6FD",
  superficie: "#FFFFFF",
  suave: "#F2EFFC",
  borda: "#E7E3F6",
  bordaForte: "#D6CFF0",

  tinta: "#1E2A78",
  texto: "#3D4372",
  textoSuave: "#6E7299",
  textoFraco: "#A3A6C2",
  /** Forma vazia ou desligada (estrela vazia, interruptor desligado). */
  inativo: "#D6CFF0",
  /** Trilho de progresso ainda não percorrido. */
  trilho: "#E7E3F6",

  roxo: "#7B61FF",
  roxoEscuro: "#6247EA",
  roxoClaro: "#EFEBFF",
  pessego: "#FFAC7A",
  pessegoEscuro: "#E98A52",
  pessegoClaro: "#FFF1E7",
  lilas: "#C9B4FF",
  lilasClaro: "#F5F0FF",
  azul: "#8FD3FF",
  azulEscuro: "#2F8FCF",
  azulClaro: "#EAF7FF",

  /** Destaques sobre fundos escuros (céu, cartões azul-noite). */
  lilasNoEscuro: "#C9B4FF",
  pessegoNoEscuro: "#FFAC7A",
};

const ALTO_CONTRASTE: typeof PADRAO = {
  fundo: "#F1F0F8",
  superficie: "#FFFFFF",
  suave: "#E6E4F2",
  borda: "#4B5080",
  bordaForte: "#0A0F3C",

  tinta: "#0A0F3C",
  texto: "#0A0F3C",
  textoSuave: "#2E3363",
  textoFraco: "#4A4F7A",
  inativo: "#6B6F96",
  trilho: "#8E92B3",

  roxo: "#4527C9",
  roxoEscuro: "#33199E",
  roxoClaro: "#E3DCFF",
  pessego: "#F28A4B",
  pessegoEscuro: "#A13E08",
  pessegoClaro: "#FFE1CC",
  lilas: "#7D62E0",
  lilasClaro: "#ECE5FF",
  azul: "#3AA0E0",
  azulEscuro: "#0A5A94",
  azulClaro: "#D6EEFF",

  lilasNoEscuro: "#E4D9FF",
  pessegoNoEscuro: "#FFC8A3",
};

type Paleta = typeof PADRAO;

let paleta: Paleta = lerPrefs().altoContraste ? ALTO_CONTRASTE : PADRAO;
let versao = 0;

/** Cores da paleta ativa (cada leitura pega o valor atual). */
export const cor = {} as Readonly<Paleta>;
for (const k of Object.keys(PADRAO) as (keyof Paleta)[]) {
  Object.defineProperty(cor, k, { enumerable: true, get: () => paleta[k] });
}

export const ehAltoContraste = () => paleta === ALTO_CONTRASTE;

/** Troca a paleta. Quem desenha a tela precisa remontar depois (ver _layout). */
export function aplicarContraste(alto: boolean) {
  const nova = alto ? ALTO_CONTRASTE : PADRAO;
  if (nova === paleta) return;
  paleta = nova;
  versao += 1;
}

/**
 * Valor de módulo que depende das cores (tabelas, listas): é recalculado
 * quando a paleta muda, sem que quem usa precise saber disso.
 */
export function porTema<T extends object>(criar: () => T): T {
  let atual = criar();
  let feito = versao;
  const ler = () => {
    if (feito !== versao) {
      atual = criar();
      feito = versao;
    }
    return atual;
  };
  // o alvo é vazio: o conteúdo real vem sempre de ler()
  return new Proxy((Array.isArray(atual) ? [] : {}) as T, {
    get: (_, k) => Reflect.get(ler(), k),
    has: (_, k) => Reflect.has(ler(), k),
    ownKeys: () => Reflect.ownKeys(ler()),
    getOwnPropertyDescriptor: (_, k) => Reflect.getOwnPropertyDescriptor(ler(), k),
  });
}

/** StyleSheet.create que acompanha a paleta ativa. */
export function criarEstilos<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  criar: () => T & StyleSheet.NamedStyles<any>,
): T {
  return porTema(() => StyleSheet.create(criar()));
}

export const fonte = {
  titulo: "Poppins_600SemiBold",
  tituloForte: "Poppins_700Bold",
  texto: "Inter_400Regular",
  textoMedio: "Inter_500Medium",
  textoForte: "Inter_600SemiBold",
} as const;

export const raio = { p: 10, m: 14, g: 20, xg: 26 } as const;

export const sombra = {
  shadowColor: "#1E2A78",
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

export const COR_MISSAO = porTema(() => ({
  roxo: { claro: cor.roxoClaro, forte: cor.roxo, texto: cor.roxo },
  pessego: { claro: cor.pessegoClaro, forte: cor.pessego, texto: cor.pessegoEscuro },
  azul: { claro: cor.azulClaro, forte: cor.azul, texto: cor.azulEscuro },
  lilas: { claro: cor.lilasClaro, forte: cor.lilas, texto: cor.roxo },
}));
