import Link from "next/link";
import type { ReactNode } from "react";
import type { FormatoId } from "@modolume/core";
import { IconeFormato, IconeSeta } from "./icones";

/**
 * Peças repetidas do painel. Visual institucional: superfícies brancas com
 * borda fina, cantos discretos, tabelas e fichas com rótulo e valor.
 */

export const pct = (n: number) => `${Math.round(n)}%`;

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
export const nomeDoMes = (m: number) => MESES[m - 1] ?? "";

/** "2026-05-12" → "12 de maio". */
export const dataPorExtenso = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return m && d ? `${d} de ${MESES[m - 1]}` : "";
};

/** "2026-05-12" → "12/05". */
export const dataCurta = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

/** "2026-05-12" → "12/05/2026". */
export const dataCompleta = (iso: string) => iso.split("-").reverse().join("/");

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
/** Dia da semana abreviado de uma data ISO. */
export const diaDaSemana = (iso: string) => SEMANA[new Date(`${iso}T12:00:00`).getDay()] ?? "";

/** Número com vírgula decimal. */
export const decimal = (n: number) => n.toFixed(1).replace(".", ",");

/** Abaixo deste acerto médio, o valor aparece em tom de alerta. */
export const LIMITE_ATENCAO = 60;

/** Cor da borda usada em todo o painel. */
export const BORDA = "border-[#D9D4EC]";

export function Cabecalho({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight">{titulo}</h1>
          {descricao ? <p className="mt-1 max-w-3xl text-sm text-texto-suave">{descricao}</p> : null}
        </div>
        {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
      </div>
      {children}
    </header>
  );
}

/** Painel com título e conteúdo; `semRecuo` para tabelas que encostam nas bordas. */
export function Painel({
  titulo,
  descricao,
  acao,
  children,
  semRecuo = false,
  className = "",
}: {
  titulo?: string;
  descricao?: string;
  acao?: { href: string; rotulo: string };
  children: ReactNode;
  semRecuo?: boolean;
  className?: string;
}) {
  return (
    <section className={`sombra-suave min-w-0 rounded-2xl bg-superficie ${className}`}>
      {titulo ? (
        <div className={`flex items-start justify-between gap-4 px-5 pt-5 pb-3`}>
          <div>
            <h2 className="text-lg">{titulo}</h2>
            {descricao ? <p className="mt-0.5 text-xs text-texto-suave">{descricao}</p> : null}
          </div>
          {acao ? (
            <Link
              href={acao.href}
              className="inline-flex min-h-11 shrink-0 items-center gap-0.5 text-sm font-semibold text-roxo-escuro"
            >
              {acao.rotulo} <IconeSeta tamanho={14} />
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className={semRecuo ? "" : "p-5"}>{children}</div>
    </section>
  );
}

/** Ficha de campos (rótulo em cima, valor embaixo), como num cadastro. */
export function Campos({
  itens,
  colunas = 4,
}: {
  itens: { rotulo: string; valor: ReactNode; detalhe?: string }[];
  colunas?: 2 | 3 | 4 | 5 | 6;
}) {
  const grade = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-3 lg:grid-cols-5",
    6: "sm:grid-cols-3 xl:grid-cols-6",
  }[colunas];
  return (
    <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border ${BORDA} bg-[#E2E4EE] ${grade}`}>
      {itens.map((i) => (
        <div key={i.rotulo} className="bg-superficie px-4 py-3">
          <dt className="text-xs text-texto-suave">{i.rotulo}</dt>
          <dd className="tnum mt-1 font-semibold text-tinta">{i.valor}</dd>
          {i.detalhe ? <dd className="mt-0.5 text-xs text-texto-suave">{i.detalhe}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/** Classes das tabelas do painel. */
export const TABELA = {
  tabela: "w-full border-collapse text-sm",
  cabeca: `border-b ${BORDA} text-left text-xs font-medium text-texto-suave`,
  th: "px-4 py-2.5 font-semibold",
  linha: `border-b ${BORDA} last:border-b-0`,
  td: "px-4 py-3 align-middle",
};

/** Botão em forma de link (primário ou secundário). */
export function BotaoLink({
  href,
  children,
  variante = "primario",
}: {
  href: string;
  children: ReactNode;
  variante?: "primario" | "secundario";
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold ${
        variante === "primario" ? "bg-roxo-escuro text-white" : `border ${BORDA} bg-superficie text-tinta`
      }`}
    >
      {children}
    </Link>
  );
}

/** Etiqueta de situação (rascunho, planejada, pede atenção…). */
export function Etiqueta({
  children,
  tom = "neutro",
}: {
  children: ReactNode;
  tom?: "neutro" | "roxo" | "alerta" | "ok";
}) {
  const cores = {
    neutro: "border-[#D5D8E5] bg-[#F4F5F9] text-texto",
    roxo: "border-lilas bg-roxo-claro text-roxo-escuro",
    alerta: "border-pessego bg-pessego-claro text-alerta",
    ok: "border-[#B9DCC8] bg-[#EEF8F2] text-[#24704A]",
  }[tom];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-xs font-semibold ${cores}`}
    >
      {children}
    </span>
  );
}

/** Quadrado com o ícone do formato, à esquerda dos itens de lista. */
export function SeloFormato({ formato, alerta = false }: { formato: FormatoId; alerta?: boolean }) {
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-md ${alerta ? "bg-pessego-claro text-alerta" : "bg-roxo-claro text-roxo-escuro"}`}
    >
      <IconeFormato formato={formato} tamanho={17} />
    </span>
  );
}

/** Iniciais num círculo (não usamos fotos de alunos). */
export function Avatar({
  nome,
  tamanho = 32,
  tom = "claro",
  svg,
}: {
  nome: string;
  tamanho?: number;
  tom?: "claro" | "escuro";
  /** Avatar que o aluno montou no app (SVG); sem ele, mostra as iniciais. */
  svg?: string | null;
}) {
  if (svg)
    return (
      // SVG gerado no app, em data URI. O elemento img não executa scripts do SVG.
      <img
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
        alt=""
        aria-hidden
        width={tamanho}
        height={tamanho}
        className="shrink-0 rounded-full"
        style={{ width: tamanho, height: tamanho }}
      />
    );
  const iniciais = nome
    .replace(/^Prof\.ª?\s*/, "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${tom === "escuro" ? "bg-tinta text-white" : "bg-[#EEF0F7] text-tinta"}`}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.36 }}
      aria-hidden
    >
      {iniciais}
    </span>
  );
}

/** Barra horizontal de acerto (0–100), em alerta abaixo do limite; o traço marca a referência. */
export function BarraAcerto({ valor, referencia }: { valor: number; referencia?: number }) {
  return (
    <div className="relative h-1.5 rounded-full bg-[#ECEEF4]" aria-hidden>
      <div
        className={`h-full rounded-full ${valor < LIMITE_ATENCAO ? "bg-alerta" : "bg-roxo"}`}
        style={{ width: `${Math.max(2, valor)}%` }}
      />
      {referencia !== undefined ? (
        <div className="absolute -top-1 h-3.5 w-0.5 bg-tinta" style={{ left: `${referencia}%` }} />
      ) : null}
    </div>
  );
}

/** Variação no período, com sinal e tom de alerta quando cai. */
export function Variacao({ pontos }: { pontos: number }) {
  return (
    <span className={`tnum ${pontos <= -5 ? "font-semibold text-alerta" : "text-texto"}`}>
      {pontos > 0 ? "+" : pontos < 0 ? "−" : ""}
      {Math.abs(pontos)} {Math.abs(pontos) === 1 ? "pt" : "pts"}
    </span>
  );
}

/** Faixas de acerto usadas nos chips de resultado. */
export const FAIXAS = [
  { min: 80, rotulo: "80% ou mais", classe: "bg-roxo-escuro text-white" },
  { min: 60, rotulo: "60 a 79%", classe: "bg-lilas text-tinta" },
  { min: 0, rotulo: "abaixo de 60%", classe: "bg-pessego text-tinta" },
] as const;

const faixa = (v: number) => FAIXAS.find((f) => v >= f.min)!;

/** Chip com o acerto de uma atividade (como as notas de um diário de classe). */
export function ChipResultado({ valor, titulo }: { valor: number; titulo: string }) {
  return (
    <span
      title={titulo}
      className={`tnum grid h-6 min-w-8 place-items-center rounded px-1 text-xs font-semibold ${faixa(valor).classe}`}
    >
      {Math.round(valor)}
    </span>
  );
}

export function LegendaFaixas() {
  return (
    <ul className="flex flex-wrap items-center gap-4 text-xs text-texto-suave">
      {FAIXAS.map((f) => (
        <li key={f.min} className="flex items-center gap-1.5">
          <span className={`size-3 rounded-sm ${f.classe}`} aria-hidden />
          {f.rotulo}
        </li>
      ))}
    </ul>
  );
}

/** Cor de cada turma, pela ordem das turmas do professor: faixa sólida, fundo claro e texto. */
export const CORES_TURMA = [
  {
    solida: "bg-roxo-escuro",
    clara: "bg-roxo-claro",
    texto: "text-roxo-escuro",
    borda: "border-l-roxo-escuro",
    hex: "#6247EA",
  },
  {
    solida: "bg-[#1F6E9F]",
    clara: "bg-azul-claro",
    texto: "text-[#1F6E9F]",
    borda: "border-l-[#1F6E9F]",
    hex: "#1F6E9F",
  },
  { solida: "bg-alerta", clara: "bg-pessego-claro", texto: "text-alerta", borda: "border-l-alerta", hex: "#B4531A" },
] as const;
export const corDaTurma = (indice: number) => CORES_TURMA[Math.max(0, indice) % CORES_TURMA.length]!;

/** Número em destaque com rótulo embaixo (sem caixa própria). */
export function Numero({
  valor,
  rotulo,
  tom = "tinta",
}: {
  valor: ReactNode;
  rotulo: string;
  tom?: "tinta" | "alerta" | "claro";
}) {
  const cor = { tinta: "text-tinta", alerta: "text-alerta", claro: "text-white" }[tom];
  return (
    <div>
      <p className={`tnum font-display text-3xl font-semibold leading-none ${cor}`}>{valor}</p>
      <p className={`mt-1.5 text-sm ${tom === "claro" ? "text-white/80" : "text-texto-suave"}`}>{rotulo}</p>
    </div>
  );
}

/** Data local no formato ISO (toISOString usaria UTC e viraria o dia à noite no Brasil). */
export const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Os cinco dias letivos (segunda a sexta) da semana de uma data. */
export function diasDaSemanaLetiva(base: Date) {
  const segunda = new Date(base);
  segunda.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return isoLocal(d);
  });
}
