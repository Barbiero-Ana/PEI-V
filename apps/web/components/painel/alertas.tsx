"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Alerta } from "@/lib/painel/alertas";
import { IconeSino } from "./icones";

const GRUPOS: { tipo: Alerta["tipo"]; nome: string; cor: string }[] = [
  { tipo: "agenda", nome: "Agenda de hoje", cor: "bg-roxo" },
  { tipo: "pendencia", nome: "Pendências", cor: "bg-pessego" },
  { tipo: "app", nome: "Atividades no app", cor: "bg-[#2E9E62]" },
  { tipo: "aluno", nome: "Alunos", cor: "bg-alerta" },
];

const chaveDoDia = (professorId: string) =>
  `modolume-alertas-vistos:${professorId}:${new Date().toLocaleDateString("sv-SE", { timeZone: "America/Cuiaba" })}`;

function lerVistos(chave: string): string[] {
  try {
    const dados: unknown = JSON.parse(localStorage.getItem(chave) ?? "[]");
    return Array.isArray(dados) ? dados.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Sino da barra superior com os alertas do dia. O número mostra quantos
 * ainda não foram lidos hoje neste navegador.
 */
export function AlertasDoDia({ alertas, professorId }: { alertas: Alerta[]; professorId: string }) {
  const [aberto, setAberto] = useState(false);
  const [vistos, setVistos] = useState<string[]>([]);
  const caixa = useRef<HTMLDivElement>(null);
  const sino = useRef<HTMLButtonElement>(null);
  const listaId = useId();
  const chave = chaveDoDia(professorId);

  useEffect(() => {
    setVistos(lerVistos(chave));
    const atualizar = (e: StorageEvent) => {
      if (e.key === chave || e.key === null) setVistos(lerVistos(chave));
    };
    window.addEventListener("storage", atualizar);
    return () => window.removeEventListener("storage", atualizar);
  }, [chave]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAberto(false);
      if (caixa.current?.contains(document.activeElement)) sino.current?.focus();
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  const novos = alertas.filter((a) => !vistos.includes(a.id)).length;

  const marcarComoLidos = (ids: string[]) => {
    const lidos = [...new Set([...lerVistos(chave), ...vistos, ...ids])];
    setVistos(lidos);
    try {
      localStorage.setItem(chave, JSON.stringify(lidos));
    } catch {
      // sem armazenamento: o número volta a aparecer ao recarregar, sem problema
    }
  };

  return (
    <div ref={caixa} className="relative">
      <button
        ref={sino}
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={aberto ? listaId : undefined}
        aria-label={`Alertas do dia${novos ? `: ${novos} novos` : ""}`}
        className={`relative grid size-11 place-items-center rounded-full ${aberto ? "bg-roxo-claro text-roxo-escuro" : "bg-[#F3F1FA] text-tinta"}`}
      >
        <IconeSino tamanho={19} />
        {novos > 0 ? (
          <span className="tnum absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-alerta px-1 text-[0.65rem] font-bold text-white">
            {novos}
          </span>
        ) : null}
      </button>

      {aberto ? (
        <div
          id={listaId}
          className="fixed inset-x-4 top-32 z-40 overflow-hidden rounded-2xl border border-borda-forte bg-superficie shadow-[0_20px_50px_-24px_rgb(30_42_120/0.5)] sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-[380px]"
        >
          <div className="border-b border-[#EEEBF6] px-5 py-4">
            <p className="font-display font-semibold text-tinta">Alertas do dia</p>
            <p role="status" className="text-xs text-texto-suave">
              {alertas.length === 0
                ? "Nada pedindo ação hoje."
                : novos === 0
                  ? "Todos os alertas foram lidos."
                  : novos === 1
                    ? "1 alerta não lido"
                    : `${novos} alertas não lidos`}
            </p>
            {alertas.length > 0 ? (
              <button
                type="button"
                disabled={novos === 0}
                onClick={() => marcarComoLidos(alertas.map((a) => a.id))}
                className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-borda-forte px-3 text-sm font-semibold text-roxo-escuro hover:bg-roxo-claro disabled:text-texto-fraco disabled:hover:bg-transparent"
              >
                Marcar todos como lidos
              </button>
            ) : null}
          </div>
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {GRUPOS.map((g) => {
              const doGrupo = alertas.filter((a) => a.tipo === g.tipo);
              if (doGrupo.length === 0) return null;
              return (
                <div key={g.tipo} className="px-2 pb-2">
                  <p className="flex items-center gap-2 px-3 pt-2 pb-1 text-xs font-semibold text-texto-suave">
                    <span className={`size-2 rounded-full ${g.cor}`} aria-hidden />
                    {g.nome}
                  </p>
                  <ul>
                    {doGrupo.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={a.href}
                          scroll={false}
                          onClick={() => {
                            marcarComoLidos([a.id]);
                            setAberto(false);
                          }}
                          className={`block rounded-xl px-3 py-2 hover:bg-suave ${vistos.includes(a.id) ? "" : "bg-roxo-claro/55"}`}
                        >
                          <span className="block text-sm font-semibold text-tinta">
                            {a.titulo}
                            {!vistos.includes(a.id) ? <span className="sr-only"> · Não lido</span> : null}
                          </span>
                          <span className="block truncate text-xs text-texto">{a.detalhe}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
