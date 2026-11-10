import type { CSSProperties } from "react";
import { CONTATO_EMAIL, SOLUCOES, type Solucao } from "@/lib/planos";

const contato = (assunto: string) => `mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent(assunto)}`;

/** Os três planos, sem preço, e logo abaixo os dois caminhos: demonstração ou equipe de vendas. */
export function Planos() {
  return (
    <div>
      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {SOLUCOES.map((s, i) => (
          <CartaoSolucao key={s.id} solucao={s} atraso={i * 140} />
        ))}
      </div>

      <div data-revelar className="mt-10 flex flex-col items-center gap-4 text-center">
        <p className="text-texto-suave">Quer ver o Modolume funcionando na sua escola?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={contato("Quero uma demonstração do Modolume")}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-roxo px-6 py-3 font-display text-[0.95rem] font-semibold text-white transition-colors hover:bg-roxo-escuro"
          >
            Solicite uma demo
          </a>
          <a
            href={contato("Falar com a equipe de vendas")}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-borda-forte bg-superficie px-6 py-3 font-display text-[0.95rem] font-semibold text-tinta transition-colors hover:bg-suave"
          >
            Fale com nossa equipe de vendas
          </a>
        </div>
      </div>
    </div>
  );
}

function CartaoSolucao({ solucao: s, atraso }: { solucao: Solucao; atraso: number }) {
  const escuro = !!s.destaque;
  return (
    <article
      data-revelar
      style={{ "--atraso": `${atraso}ms` } as CSSProperties}
      className={`flex flex-col rounded-3xl p-7 ${
        escuro
          ? "bg-tinta text-white shadow-[0_24px_60px_-30px_rgb(30_42_120/0.7)]"
          : "border border-borda bg-superficie shadow-[var(--shadow-cartao)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={`text-xl ${escuro ? "text-white" : ""}`}>{s.nome}</h3>
        {escuro ? (
          <span className="shrink-0 rounded-full bg-pessego px-3 py-1 text-xs font-semibold text-tinta">
            Mais completo
          </span>
        ) : null}
      </div>
      <p className={`mt-2 leading-relaxed ${escuro ? "text-lilas" : "text-texto-suave"}`}>{s.paraQuem}</p>
      <ul className={`mt-6 flex flex-col gap-3 border-t pt-6 ${escuro ? "border-white/10" : "border-borda"}`}>
        {s.inclui.map((item) => (
          <li key={item} className={`flex gap-3 text-[0.95rem] ${escuro ? "text-white" : "text-texto"}`}>
            <Marca escuro={escuro} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Marca({ escuro = false }: { escuro?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="10" fill={escuro ? "rgb(255 255 255 / 0.12)" : "#E3DBFF"} />
      <path
        d="m6 10.2 2.6 2.6L14 7.4"
        fill="none"
        stroke={escuro ? "#FFAC7A" : "#7B61FF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
