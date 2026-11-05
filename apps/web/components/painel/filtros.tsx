import Link from "next/link";
import { corDaTurma } from "./blocos";
import { SeletorTurma } from "./seletor-turma";

/**
 * Filtros do painel, iguais em todas as páginas: um rótulo visível ("Turma",
 * "Situação"…), as opções lado a lado com a contagem de cada uma e a escolhida
 * preenchida. Cada opção é um link (o filtro fica no endereço, dá para voltar e
 * compartilhar) com pelo menos 44 px de altura.
 */

export interface OpcaoFiltro {
  valor: string;
  nome: string;
  /** Quantos itens a opção mostra; fica ao lado do nome. */
  n?: number;
  /** Classe da bolinha de cor (a cor da turma). */
  cor?: string;
  tom?: "alerta";
}

export function Filtro({
  rotulo,
  opcoes,
  atual,
  href,
}: {
  rotulo: string;
  opcoes: OpcaoFiltro[];
  atual: string;
  href: (valor: string) => string;
}) {
  return (
    <nav aria-label={`Filtrar por ${rotulo.toLowerCase()}`} className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <span className="mr-1 text-sm font-medium text-texto-suave">{rotulo}</span>
      {opcoes.map((o) => {
        const sel = o.valor === atual;
        return (
          <Link
            key={o.valor || "todas"}
            href={href(o.valor)}
            scroll={false}
            aria-current={sel ? "true" : undefined}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold ${
              sel
                ? "border-tinta bg-tinta text-white"
                : o.tom === "alerta"
                  ? "border-[#F2B48E] bg-pessego-claro text-alerta"
                  : "border-[#D9D4EC] bg-superficie text-tinta hover:border-roxo/50"
            }`}
          >
            {o.cor ? (
              <span className={`size-2.5 rounded-full ${o.cor} ${sel ? "ring-2 ring-white" : ""}`} aria-hidden />
            ) : null}
            {o.nome}
            {o.n !== undefined ? (
              <span className={`tnum text-xs font-medium ${sel ? "text-white/80" : "text-texto-suave"}`}>{o.n}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Filtro de turma: um seletor com "Todas as turmas" (opcional) e cada turma com
 * a sua cor. Funciona igual com poucas ou muitas turmas.
 */
export function FiltroTurmas({
  turmas,
  atual,
  href,
  todas = true,
}: {
  turmas: { id: string; nome: string }[];
  atual: string;
  href: (turmaId: string) => string;
  todas?: boolean;
}) {
  const opcoes = [
    ...(todas ? [{ valor: "", nome: "Todas as turmas", href: href("") }] : []),
    ...turmas.map((t, i) => ({
      valor: t.id,
      nome: t.nome,
      cor: corDaTurma(i).solida,
      href: href(t.id),
    })),
  ];
  return <SeletorTurma opcoes={opcoes} atual={atual} />;
}

/** Monta o endereço com os filtros atuais trocando só o que mudou (valores vazios saem do endereço). */
export function comFiltros(base: string, atuais: Record<string, string>, mudar: Record<string, string>) {
  const p = new URLSearchParams({ ...atuais, ...mudar });
  for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
  const q = p.toString();
  return q ? `${base}?${q}` : base;
}
