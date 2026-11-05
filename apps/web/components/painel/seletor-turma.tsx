"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface OpcaoTurma {
  valor: string;
  nome: string;
  href: string;
  /** Classe da bolinha com a cor da turma. */
  cor?: string;
}

/** A partir de quantas opções a lista ganha o campo de busca. */
const COM_BUSCA = 6;

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * Seletor de turma: um botão com a turma escolhida que abre uma lista. Serve
 * para 2 ou para 30 turmas (lei de Hick: uma escolha por vez, e a busca filtra
 * a lista quando ela fica longa). A lista flutua sobre a página, sem empurrar o
 * conteúdo. Teclado: setas, Enter, Esc; digitar filtra.
 */
export function SeletorTurma({
  opcoes,
  atual,
  rotulo = "Turma",
}: {
  opcoes: OpcaoTurma[];
  atual: string;
  rotulo?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [foco, setFoco] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  const escolhida = opcoes.find((o) => o.valor === atual) ?? opcoes[0]!;
  const visiveis = opcoes.filter((o) => !busca || normalizar(o.nome).includes(normalizar(busca)));

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    setBusca("");
    setFoco(
      Math.max(
        0,
        opcoes.findIndex((o) => o.valor === atual),
      ),
    );
    if (opcoes.length > COM_BUSCA) campo.current?.focus();
  }, [aberto, atual, opcoes]);

  const escolher = (o: OpcaoTurma) => {
    setAberto(false);
    botao.current?.focus();
    if (o.valor !== atual) router.push(o.href, { scroll: false });
  };

  const teclado = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setAberto(false);
      botao.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!aberto) setAberto(true);
      else setFoco((f) => Math.min(visiveis.length - 1, f + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFoco((f) => Math.max(0, f - 1));
    } else if (e.key === "Enter" && aberto && visiveis[foco]) {
      e.preventDefault();
      escolher(visiveis[foco]!);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span id={`${id}-rotulo`} className="mr-1 text-sm font-medium text-texto-suave">
        {rotulo}
      </span>
      <div ref={caixa} className="relative" onKeyDown={teclado}>
        <button
          ref={botao}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-labelledby={`${id}-rotulo ${id}-valor`}
          aria-activedescendant={aberto && visiveis[foco] ? `${id}-op-${foco}` : undefined}
          onClick={() => setAberto((a) => !a)}
          className="inline-flex min-h-11 min-w-56 items-center gap-2 rounded-xl border border-[#D9D4EC] bg-superficie px-3.5 text-sm font-semibold text-tinta hover:border-roxo/50"
        >
          {escolhida.cor ? <span className={`size-2.5 shrink-0 rounded-full ${escolhida.cor}`} aria-hidden /> : null}
          <span id={`${id}-valor`} className="flex-1 truncate text-left">
            {escolhida.nome}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {aberto ? (
          <div className="absolute top-full right-0 left-0 z-40 mt-2 rounded-2xl border border-[#E2DEF0] bg-superficie p-2 shadow-[0_20px_50px_-24px_rgb(30_42_120/0.5)]">
            {opcoes.length > COM_BUSCA ? (
              <input
                ref={campo}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setFoco(0);
                }}
                placeholder="Buscar turma"
                aria-label="Buscar turma"
                aria-activedescendant={visiveis[foco] ? `${id}-op-${foco}` : undefined}
                className="mb-2 h-11 w-full rounded-xl border border-[#D9D4EC] bg-[#FAF9FE] px-3 text-sm text-tinta outline-none focus:border-roxo"
              />
            ) : null}
            <ul role="listbox" aria-labelledby={`${id}-rotulo`} className="max-h-72 overflow-y-auto">
              {visiveis.length === 0 ? (
                <li className="px-3 py-3 text-sm text-texto">Nenhuma turma com esse nome.</li>
              ) : (
                visiveis.map((o, i) => {
                  const sel = o.valor === atual;
                  return (
                    <li
                      key={o.valor || "todas"}
                      id={`${id}-op-${i}`}
                      role="option"
                      aria-selected={sel}
                      onMouseEnter={() => setFoco(i)}
                      onClick={() => escolher(o)}
                      className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm ${i === foco ? "bg-roxo-claro" : ""} ${sel ? "font-semibold text-roxo-escuro" : "text-tinta"}`}
                    >
                      {o.cor ? (
                        <span className={`size-2.5 shrink-0 rounded-full ${o.cor}`} aria-hidden />
                      ) : (
                        <span className="size-2.5 shrink-0" aria-hidden />
                      )}
                      <span className="flex-1 truncate">{o.nome}</span>
                      {sel ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          aria-hidden
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
