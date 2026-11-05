"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Conteúdo organizado em pastas, com as abas na lateral esquerda: o nome e a
 * descrição de cada pasta ficam sempre visíveis, um embaixo do outro, e o
 * conteúdo ocupa o resto da largura. Em telas estreitas, as abas viram uma
 * faixa com rolagem acima do conteúdo. Trocar de pasta é instantâneo (o
 * conteúdo de todas já veio do servidor); a pasta aberta vai para o endereço,
 * para continuar aberta ao recarregar. As setas do teclado trocam de pasta.
 * O painel tem altura mínima, para a página não "pular" ao trocar de pasta.
 */
export function Pastas({
  abas,
  inicial,
  paineis,
  rotulo = "Seções",
  parametro = "aba",
}: {
  abas: { id: string; nome: string; descricao?: string; contagem?: number; tom?: "alerta" }[];
  /** Nome do conjunto de pastas, para o leitor de tela. */
  rotulo?: string;
  /** Nome do parâmetro do endereço que guarda a pasta aberta. */
  parametro?: string;
  inicial: string;
  paineis: Record<string, ReactNode>;
}) {
  const [aberta, setAberta] = useState(abas.some((a) => a.id === inicial) ? inicial : abas[0]!.id);

  const abrir = (id: string) => {
    setAberta(id);
    const url = new URL(window.location.href);
    if (id === abas[0]!.id) url.searchParams.delete(parametro);
    else url.searchParams.set(parametro, id);
    window.history.replaceState(null, "", url);
  };

  const teclado = (e: KeyboardEvent) => {
    const i = abas.findIndex((a) => a.id === aberta);
    const destino =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (i + 1) % abas.length
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (i - 1 + abas.length) % abas.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? abas.length - 1
              : -1;
    if (destino < 0) return;
    e.preventDefault();
    abrir(abas[destino]!.id);
    document.getElementById(`pasta-${abas[destino]!.id}`)?.focus();
  };

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-5">
      <div
        role="tablist"
        aria-label={rotulo}
        aria-orientation="vertical"
        onKeyDown={teclado}
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:sticky lg:top-0 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {abas.map((a) => {
          const sel = a.id === aberta;
          return (
            <button
              key={a.id}
              type="button"
              role="tab"
              id={`pasta-${a.id}`}
              aria-selected={sel}
              aria-controls={`painel-${a.id}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => abrir(a.id)}
              className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl border-l-4 px-3.5 py-2.5 text-left lg:w-full ${
                sel
                  ? "sombra-suave border-l-roxo bg-superficie"
                  : "border-l-transparent bg-[#E9E6F5] hover:bg-white/70 lg:bg-transparent"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-semibold whitespace-nowrap ${a.tom === "alerta" ? "text-alerta" : sel ? "text-tinta" : "text-texto"}`}
                >
                  {a.nome}
                </span>
                {a.descricao ? (
                  <span className="mt-0.5 hidden text-xs leading-snug text-texto-suave lg:block">{a.descricao}</span>
                ) : null}
              </span>
              {a.contagem !== undefined ? (
                <span
                  className={`tnum shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${a.tom === "alerta" ? "bg-alerta text-white" : sel ? "bg-roxo-claro text-roxo-escuro" : "bg-white/80 text-texto-suave"}`}
                >
                  {a.contagem}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {abas.map((a) => (
        <div
          key={a.id}
          role="tabpanel"
          id={`painel-${a.id}`}
          aria-labelledby={`pasta-${a.id}`}
          hidden={a.id !== aberta}
          className="sombra-suave min-w-0 rounded-2xl bg-superficie p-5 lg:min-h-[480px]"
        >
          {paineis[a.id]}
        </div>
      ))}
    </div>
  );
}
