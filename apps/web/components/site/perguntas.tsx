"use client";

import { useId, useState } from "react";

/** Perguntas frequentes: abre e fecha com a altura animada (uma de cada vez). */
export function Perguntas({ itens }: { itens: { p: string; r: string }[] }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const base = useId();

  return (
    <div className="divide-y divide-borda border-y border-borda">
      {itens.map((q, i) => {
        const ativa = aberta === i;
        const idResposta = `${base}-r${i}`;
        return (
          <div key={q.p}>
            <h3>
              <button
                type="button"
                aria-expanded={ativa}
                aria-controls={idResposta}
                onClick={() => setAberta(ativa ? null : i)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-display text-lg font-semibold text-tinta"
              >
                {q.p}
                <span
                  aria-hidden
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-xl leading-none transition-all duration-300 ${
                    ativa ? "rotate-45 bg-roxo text-white" : "bg-suave text-roxo"
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={idResposta}
              role="region"
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                ativa ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden" inert={!ativa}>
                <p className="pb-5 pr-12 leading-relaxed text-texto-suave">{q.r}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
