import Link from "next/link";
import type { Insight } from "@/lib/painel/insights";

/** Marca de cada tipo de dica (cor da bolinha ao lado do título). */
const MARCA: Record<Insight["tipo"], string> = {
  forte: "bg-roxo-escuro",
  ensinar: "bg-roxo",
  avaliar: "bg-[#1F6E9F]",
  ponte: "bg-lilas",
  ritmo: "bg-pessego",
  evolucao: "bg-[#2E9E62]",
  dados: "bg-texto-fraco",
};

/**
 * Bloco de insights: um destaque no topo (o ponto forte) e as dicas em
 * linhas, cada uma com a base em números logo abaixo.
 */
export function PainelInsights({
  titulo,
  destaque,
  dicas,
  acao,
  acaoSecundaria,
}: {
  titulo: string;
  destaque?: { rotulo: string; valor: string; detalhe: string } | null;
  dicas: Insight[];
  acao?: { href: string; rotulo: string };
  acaoSecundaria?: { href: string; rotulo: string };
}) {
  return (
    <section className="sombra-suave overflow-hidden rounded-2xl bg-superficie">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-lg">{titulo}</h2>
          <p className="mt-0.5 text-sm text-texto-suave">
            Dicas a partir dos dados, para modelar atividades e provas. Não são diagnóstico.
          </p>
        </div>
        {acao || acaoSecundaria ? (
          <div className="flex flex-wrap gap-2">
            {acaoSecundaria ? (
              <Link
                href={acaoSecundaria.href}
                className="inline-flex h-11 items-center rounded-full border border-[#D9D4EC] px-4 text-sm font-semibold text-tinta"
              >
                {acaoSecundaria.rotulo}
              </Link>
            ) : null}
            {acao ? (
              <Link
                href={acao.href}
                className="inline-flex h-11 items-center rounded-full bg-roxo-escuro px-4 text-sm font-semibold text-white"
              >
                {acao.rotulo}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {destaque ? (
        <div className="mx-5 mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[#F3F0FF] px-4 py-3">
          <span className="text-sm text-texto">{destaque.rotulo}</span>
          <span className="font-display text-xl font-semibold text-roxo-escuro">{destaque.valor}</span>
          <span className="text-sm text-texto">{destaque.detalhe}</span>
        </div>
      ) : null}

      <ul className="mt-2 px-5 pb-3">
        {dicas.map((d) => (
          <li
            key={d.titulo}
            className="grid gap-1 border-t border-[#EEEBF6] py-3.5 first:border-t-0 sm:grid-cols-[190px_1fr] sm:gap-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-tinta">
              <span className={`size-2.5 shrink-0 rounded-full ${MARCA[d.tipo]}`} aria-hidden />
              {d.titulo}
            </p>
            <div>
              <p className="text-sm leading-relaxed text-texto">{d.texto}</p>
              {d.base ? <p className="mt-1 text-xs text-texto-suave">Base: {d.base}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
