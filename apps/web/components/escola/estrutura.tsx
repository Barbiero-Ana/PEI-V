import type { ReactNode } from "react";
import Link from "next/link";
import { NOME_SEGMENTO } from "@modolume/core";
import { Simbolo } from "@/components/simbolo";
import { MenuCompacto, MenuLateral, type Area } from "@/components/painel/menu";
import { Avatar } from "@/components/painel/blocos";
import { IconeSair } from "@/components/painel/icones";
import { NOME_DO_PAPEL, euLogado } from "@/lib/escola/api";

/**
 * Estrutura das áreas da coordenação e do administrador, igual à do painel do
 * professor: menu roxo com o nome das seções, barra superior e conteúdo que rola.
 */
export async function Estrutura({ area, children }: { area: Exclude<Area, "professor">; children: ReactNode }) {
  const eu = await euLogado();
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-tinta focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <div className="min-h-screen bg-[#F1EFF8] lg:flex lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-roxo px-4 py-2.5 lg:hidden">
          <span className="grid size-10 shrink-0 place-items-center">
            <Simbolo tamanho={32} rotulo="Modolume" cor="#FFFFFF" />
          </span>
          <MenuCompacto avisos={{}} area={area} />
        </div>

        <aside className="hidden w-[248px] shrink-0 flex-col gap-6 bg-roxo px-3 py-5 lg:flex">
          <div className="flex items-center gap-2.5 px-2">
            <Simbolo tamanho={34} rotulo="Modolume" cor="#FFFFFF" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold text-white">Modolume</span>
              <span className="block truncate text-xs text-white/75">{eu.instituicao.nome}</span>
            </span>
          </div>
          <p className="mx-2 -mt-2 w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {NOME_DO_PAPEL[eu.papel]}
            {eu.segmento ? ` · ${NOME_SEGMENTO[eu.segmento]}` : ""}
          </p>
          <MenuLateral avisos={{}} area={area} />
          <form action="/sair" method="post">
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white hover:bg-white/12"
            >
              <IconeSair tamanho={20} /> Sair do painel
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
          <header className="flex flex-wrap items-center justify-end gap-3 border-b border-[#E2DEF0] bg-superficie px-5 py-3 lg:px-8">
            <Link
              href="/conta/senha"
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-texto-suave hover:bg-suave hover:text-tinta"
            >
              Trocar senha
            </Link>
            <span className="flex items-center gap-2.5 rounded-full bg-[#F3F1FA] py-1 pr-4 pl-1">
              <Avatar nome={eu.nome} tamanho={32} tom="escuro" />
              <span className="hidden text-sm font-semibold text-tinta sm:block">{eu.nome}</span>
            </span>
            <form action="/sair" method="post" className="lg:hidden">
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-texto"
              >
                <IconeSair tamanho={18} /> Sair
              </button>
            </form>
          </header>
          <main id="conteudo" className="relative w-full min-w-0 flex-1 px-5 py-7 lg:overflow-y-auto lg:px-8">
            {area === "coordenacao" && !eu.segmento ? (
              <p className="mb-5 rounded-xl bg-pessego-claro px-4 py-3 text-sm text-tinta">
                Seu segmento ainda está a definir. A administração pode atribuí-lo em Equipe e acessos.
              </p>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

/** Bloco de número com rótulo, para os resumos das áreas. */
export function Indicador({
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  rotulo: string;
  valor: ReactNode;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div className={`rounded-2xl px-5 py-4 ${destaque ? "bg-roxo text-white" : "sombra-suave bg-superficie"}`}>
      <p className={`text-sm ${destaque ? "text-white/80" : "text-texto-suave"}`}>{rotulo}</p>
      <p className={`tnum mt-1 font-display text-3xl font-semibold ${destaque ? "text-white" : "text-tinta"}`}>
        {valor}
      </p>
      {detalhe ? (
        <p className={`mt-0.5 text-xs ${destaque ? "text-white/75" : "text-texto-suave"}`}>{detalhe}</p>
      ) : null}
    </div>
  );
}

/** Barra de acerto (0 a 100) com o número ao lado; vazia quando não há dados. */
export function BarraValor({ valor, cor = "bg-roxo" }: { valor: number | null; cor?: string }) {
  if (valor === null) return <span className="text-sm text-texto-fraco">sem dados</span>;
  return (
    <span className="flex min-w-[120px] items-center gap-2.5">
      <span className="h-2 flex-1 rounded-full bg-suave">
        <span
          className={`block h-full rounded-full ${valor < 60 ? "bg-pessego" : cor}`}
          style={{ width: `${valor}%` }}
        />
      </span>
      <span className="tnum w-10 text-right text-sm font-semibold text-tinta">{valor}%</span>
    </span>
  );
}

/** Data e hora curtas em português (fuso de Cuiabá, o da escola). */
export function quando(iso: string | Date | null) {
  if (!iso) return "nunca";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Cuiaba",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
