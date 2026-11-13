import { PRECOS_LOJA } from "@modolume/core";
import { memo, useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path, SvgXml } from "react-native-svg";
import { createAvatar } from "@dicebear/core";
import * as bigSmile from "@dicebear/big-smile";

/**
 * Avatar do aluno: rosto gerado pela biblioteca DiceBear (estilo "Big Smile",
 * de Ashley Seo, licença CC BY 4.0), montado no próprio app, sem internet.
 * O fundo é desenhado por nós (inclusive os fundos especiais da loja).
 */

export const PELES = ["ffe4c0", "f5d7b1", "efcc9f", "e2ba87", "c99c62", "a47539", "8c5a2b", "643d19"] as const;
export const CORES_CABELO = ["220f00", "3a1a00", "71472d", "e2ba87", "d56c0c", "e9b729", "605de4", "238d80"] as const;
/** Fundos: os 6 primeiros são livres; os especiais vêm da loja. */
export const FUNDOS = [
  "#C9B4FF",
  "#FFAC7A",
  "#8FD3FF",
  "#7B61FF",
  "#A9D8B8",
  "#FFD9A0",
  "galaxia",
  "aurora",
  "porDoSol",
] as const;

export const CABELOS = [
  "shortHair",
  "bangs",
  "straightHair",
  "wavyBob",
  "curlyBob",
  "curlyShortHair",
  "braids",
  "bunHair",
  "froBun",
  "bowlCutHair",
  "mohawk",
  "halfShavedHead",
  "shavedHead",
] as const;
export const OLHOS = ["normal", "cheery", "starstruck", "winking", "sleepy", "confused", "sad", "angry"] as const;
export const BOCAS = [
  "openedSmile",
  "teethSmile",
  "gapSmile",
  "kawaii",
  "awkwardSmile",
  "braces",
  "unimpressed",
  "openSad",
] as const;
export const ACESSORIOS = [
  "nenhum",
  "glasses",
  "sunglasses",
  "sailormoonCrown",
  "catEars",
  "clownNose",
  "mustache",
  "sleepMask",
  "faceMask",
] as const;

export interface Rosto {
  pele: number;
  cabelo: (typeof CABELOS)[number];
  corCabelo: number;
  olhos: (typeof OLHOS)[number];
  boca: (typeof BOCAS)[number];
  acessorio: (typeof ACESSORIOS)[number];
  fundo: number;
}

export const ROSTO_PADRAO: Rosto = {
  pele: 2,
  cabelo: "shortHair",
  corCabelo: 1,
  olhos: "normal",
  boca: "openedSmile",
  acessorio: "nenhum",
  fundo: 0,
};

// rostos salvos na versão antiga (desenho próprio) → peças do DiceBear
const CABELO_ANTIGO: Record<string, Rosto["cabelo"]> = {
  curto: "shortHair",
  franja: "bangs",
  longo: "straightHair",
  cacheado: "curlyBob",
  coque: "bunHair",
  raspado: "shavedHead",
};
const OLHOS_ANTIGOS: Record<string, Rosto["olhos"]> = {
  redondos: "normal",
  grandes: "starstruck",
  sorridentes: "cheery",
  piscando: "winking",
};
const BOCA_ANTIGA: Record<string, Rosto["boca"]> = {
  sorriso: "openedSmile",
  risada: "teethSmile",
  tranquila: "awkwardSmile",
  surpresa: "kawaii",
};
const ACESSORIO_ANTIGO: Record<string, Rosto["acessorio"]> = {
  oculos: "glasses",
  oculosQuadrado: "glasses",
  oculosEstrela: "sunglasses",
  coroa: "sailormoonCrown",
  tiaraEstrela: "sailormoonCrown",
  antenas: "catEars",
};

/** Aceita rostos de versões antigas e completa o que faltar. */
export function normalizar(bruto: object): Rosto {
  const r = { ...ROSTO_PADRAO, ...bruto } as Rosto & Record<string, unknown>;
  const cabelo = (CABELOS as readonly string[]).includes(r.cabelo)
    ? r.cabelo
    : (CABELO_ANTIGO[r.cabelo] ?? ROSTO_PADRAO.cabelo);
  const olhos = (OLHOS as readonly string[]).includes(r.olhos) ? r.olhos : (OLHOS_ANTIGOS[r.olhos] ?? "normal");
  const boca = (BOCAS as readonly string[]).includes(r.boca) ? r.boca : (BOCA_ANTIGA[r.boca] ?? "openedSmile");
  const antigoCabeca = typeof r.cabeca === "string" ? ACESSORIO_ANTIGO[r.cabeca] : undefined;
  const acessorio = (ACESSORIOS as readonly string[]).includes(r.acessorio)
    ? r.acessorio
    : (ACESSORIO_ANTIGO[r.acessorio] ?? antigoCabeca ?? "nenhum");
  return {
    pele: Math.min(PELES.length - 1, Math.max(0, Number(r.pele) || 0)),
    cabelo,
    corCabelo: Math.min(CORES_CABELO.length - 1, Math.max(0, Number(r.corCabelo) || 0)),
    olhos,
    boca,
    acessorio,
    fundo: Math.min(FUNDOS.length - 1, Math.max(0, Number(r.fundo) || 0)),
  };
}

export type Slot = "acessorio" | "fundo";

export interface ItemLoja {
  id: string;
  nome: string;
  preco: number;
  slot: Slot;
  valor: string | number;
}

const catalogo: Omit<ItemLoja, "preco">[] = [
  { id: "acessorio:sailormoonCrown", nome: "Coroa", slot: "acessorio", valor: "sailormoonCrown" },
  { id: "acessorio:catEars", nome: "Orelhas de gato", slot: "acessorio", valor: "catEars" },
  { id: "acessorio:sunglasses", nome: "Óculos escuros", slot: "acessorio", valor: "sunglasses" },
  { id: "acessorio:sleepMask", nome: "Máscara de dormir", slot: "acessorio", valor: "sleepMask" },
  { id: "acessorio:clownNose", nome: "Nariz de palhaço", slot: "acessorio", valor: "clownNose" },
  { id: "acessorio:mustache", nome: "Bigode", slot: "acessorio", valor: "mustache" },
  { id: "fundo:6", nome: "Fundo galáxia", slot: "fundo", valor: 6 },
  { id: "fundo:7", nome: "Fundo aurora", slot: "fundo", valor: 7 },
  { id: "fundo:8", nome: "Fundo pôr do sol", slot: "fundo", valor: 8 },
];

export const ITENS_LOJA: ItemLoja[] = catalogo.map((i) => ({ ...i, preco: PRECOS_LOJA[i.id]! }));

export function itemDe(slot: Slot, valor: string | number) {
  return ITENS_LOJA.find((i) => i.slot === slot && i.valor === valor);
}

export function vestir(r: Rosto, item: ItemLoja): Rosto {
  return { ...r, [item.slot]: item.valor } as Rosto;
}

const sortear = <T,>(lista: readonly T[]) => lista[Math.floor(Math.random() * lista.length)]!;

/** Sorteia um rosto só com peças grátis (ou já compradas). */
export function rostoAleatorio(compras: string[] = []): Rosto {
  const livre = (slot: Slot, v: string | number) => {
    const item = itemDe(slot, v);
    return !item || compras.includes(item.id);
  };
  return {
    pele: Math.floor(Math.random() * PELES.length),
    cabelo: sortear(CABELOS),
    corCabelo: Math.floor(Math.random() * 6),
    olhos: sortear(OLHOS.slice(0, 5)),
    boca: sortear(BOCAS.slice(0, 6)),
    acessorio: Math.random() < 0.6 ? "nenhum" : sortear(ACESSORIOS.filter((a) => livre("acessorio", a))),
    fundo: sortear(FUNDOS.map((_, i) => i).filter((i) => livre("fundo", i))),
  };
}

const estrela = (x: number, y: number, r: number) =>
  `M${x} ${y - r} L${x + r * 0.32} ${y - r * 0.32} L${x + r} ${y} L${x + r * 0.32} ${y + r * 0.32} L${x} ${y + r} L${x - r * 0.32} ${y + r * 0.32} L${x - r} ${y} L${x - r * 0.32} ${y - r * 0.32} Z`;

function Fundo({ indice }: { indice: number }) {
  const f = FUNDOS[indice] ?? FUNDOS[0];
  if (f === "galaxia")
    return (
      <G>
        <Circle cx={50} cy={50} r={50} fill="#1E2A78" />
        <Path
          d="M10 62 C30 40 60 70 92 40"
          stroke="#7B61FF"
          strokeWidth={10}
          fill="none"
          opacity={0.35}
          strokeLinecap="round"
        />
        {[
          [18, 22, 1.4],
          [80, 18, 1.8],
          [88, 60, 1.2],
          [12, 80, 1.6],
          [70, 86, 1.2],
          [30, 12, 1],
          [60, 8, 1.2],
        ].map(([x, y, r], i) => (
          <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" />
        ))}
        <Path d={estrela(84, 32, 4)} fill="#FFD9A0" />
      </G>
    );
  if (f === "aurora")
    return (
      <G>
        <Circle cx={50} cy={50} r={50} fill="#2A3488" />
        <Path
          d="M0 46 C20 30 40 54 60 38 C75 26 90 34 100 30 V52 C88 58 72 48 58 60 C40 74 20 52 0 64 Z"
          fill="#8FD3FF"
          opacity={0.55}
        />
        <Path
          d="M0 60 C22 48 40 70 62 56 C78 46 90 54 100 50 V64 C86 70 72 62 58 72 C40 84 20 66 0 76 Z"
          fill="#C9B4FF"
          opacity={0.55}
        />
      </G>
    );
  if (f === "porDoSol")
    return (
      <G>
        <Circle cx={50} cy={50} r={50} fill="#FFD9A0" />
        <Circle cx={50} cy={78} r={30} fill="#FFAC7A" />
      </G>
    );
  return <Circle cx={50} cy={50} r={50} fill={f} />;
}

/**
 * Deixa o SVG do DiceBear compatível com o react-native-svg do Android:
 * tira metadados e a máscara de recorte, ignora o modo de mescla e escreve
 * números como ".85" na forma "0.85" (o leitor de transformações do celular
 * não entende o número sem o zero).
 */
function limpar(xml: string) {
  return xml
    .replace(/<metadata[\s\S]*?<\/metadata>/, "")
    .replace(/<mask[\s\S]*?<\/mask>/g, "")
    .replace(/ mask="url\([^)]*\)"/g, "")
    .replace(/ style="mix-blend-mode:[^"]*"/g, "")
    .replace(/([\s(,-])\.(\d)/g, "$10.$2");
}

function gerarSvg(r: Rosto) {
  return createAvatar(bigSmile, {
    seed: "modolume",
    hair: [r.cabelo],
    hairColor: [CORES_CABELO[r.corCabelo] ?? CORES_CABELO[0]],
    skinColor: [PELES[r.pele] ?? PELES[2]],
    eyes: [r.olhos],
    mouth: [r.boca],
    accessories: r.acessorio === "nenhum" ? [] : [r.acessorio],
    accessoriesProbability: r.acessorio === "nenhum" ? 0 : 100,
    backgroundColor: ["transparent"],
    // o rosto ocupa o quadro todo; reduzimos um pouco para caber no círculo
    scale: 84,
    translateY: 3,
  }).toString();
}

/** Cor chapada equivalente a cada fundo (usada fora do app, como no PDF). */
const COR_FUNDO_ESPECIAL: Record<string, string> = { galaxia: "#1E2A78", aurora: "#2A3488", porDoSol: "#FFAC7A" };

/** Rosto completo como SVG em texto, com o fundo, para documentos (PDF). */
export function svgDoRosto(bruto: object, tamanho = 96) {
  const r = normalizar(bruto);
  const f = FUNDOS[r.fundo] ?? FUNDOS[0];
  const fundo = COR_FUNDO_ESPECIAL[f] ?? f;
  const circulo = `<circle cx="${tamanho / 2}" cy="${tamanho / 2}" r="${tamanho / 2}" fill="${fundo}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}">${circulo}${rostoEmGrupo(gerarSvg(r), tamanho)}</svg>`;
}

/**
 * Coloca o SVG do DiceBear dentro de um grupo já na escala certa, em vez de um
 * <svg> aninhado: o react-native-svg não aplica o viewBox de um <svg> interno,
 * e o rosto aparecia minúsculo no app (no navegador funcionava).
 */
function rostoEmGrupo(svg: string, tamanho: number) {
  const abertura = svg.match(/<svg[^>]*>/);
  if (!abertura) return "";
  const vb = abertura[0].match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
  const largura = vb ? Number(vb[1]) : tamanho;
  const miolo = svg.slice(abertura.index! + abertura[0].length, svg.lastIndexOf("</svg>"));
  // mesma limpeza do avatar do app: o leitor de SVG do celular falha com metadados e máscaras
  return `<g transform="scale(${tamanho / largura})">${limpar(miolo)}</g>`;
}

/** SVG do rosto para o app (gerado uma vez por combinação de peças). */
function useXml(r: Rosto) {
  return useMemo(() => limpar(gerarSvg(r)), [r.cabelo, r.corCabelo, r.pele, r.olhos, r.boca, r.acessorio]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Desenho do rosto: fundo nosso + rosto do DiceBear por cima. */
export const DesenhoRosto = memo(function DesenhoRosto({
  rosto: bruto,
  tamanho = 48,
}: {
  rosto: Rosto;
  tamanho?: number;
}) {
  const rosto = normalizar(bruto);
  const xml = useXml(rosto);
  return (
    <View style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, overflow: "hidden" }}>
      <Svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        <Fundo indice={rosto.fundo} />
      </Svg>
      <SvgXml xml={xml} width={tamanho} height={tamanho} />
    </View>
  );
});
