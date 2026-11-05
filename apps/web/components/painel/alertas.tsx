"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Alerta } from "@/lib/painel/alertas";
import { IconeSino } from "./icones";

const GRUPOS: { tipo: Alerta["tipo"]; nome: string; cor: string }[] = [
  { tipo: "agenda", nome: "Agenda de hoje", cor: "bg-roxo" },
  { tipo: "pendencia", nome: "Pendências", cor: "bg-pessego" },
  { tipo: "app", nome: "Atividades no app", cor: "bg-[#2E9E62]" },
  { tipo: "aluno", nome: "Alunos", cor: "bg-alerta" },
];

/** Chave do dia para lembrar quais alertas o professor já viu (só neste navegador). */
const chaveDoDia = () => `modolume-alertas-vistos-${new Date().toDateString()}`;

/**
 * Sino da barra superior com os alertas do dia. O número mostra quantos
 * ainda não foram vistos hoje; abrir a lista marca todos como vistos.
 */
export function AlertasDoDia({ alertas }: { alertas: Alerta[] }) {
  const [aberto, setAberto] = useState(false);
  const [vistos, setVistos] = useState<string[]>([]);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setVistos(JSON.parse(localStorage.getItem(chaveDoDia()) ?? "[]"));
    } catch {
      setVistos([]);
    }
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  const novos = alertas.filter((a) => !vistos.includes(a.id)).length;

  const abrir = () => {
    setAberto((v) => !v);
    const todos = alertas.map((a) => a.id);
    setVistos(todos);
    try {
      localStorage.setItem(chaveDoDia(), JSON.stringify(todos));
    } catch {
      // sem armazenamento: o número volta a aparecer ao recarregar, sem problema
    }
  };

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={abrir}
        aria-expanded={aberto}
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
        <div className="absolute top-12 right-0 z-40 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#E2DEF0] bg-superficie shadow-[0_20px_50px_-24px_rgb(30_42_120/0.5)]">
          <div className="border-b border-[#EEEBF6] px-5 py-4">
            <p className="font-display font-semibold text-tinta">Alertas do dia</p>
            <p className="text-xs text-texto-suave">
              {alertas.length === 0
                ? "Nada pedindo ação hoje."
                : `${alertas.length} ${alertas.length === 1 ? "item" : "itens"} pedindo ação`}
            </p>
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
                          onClick={() => setAberto(false)}
                          className="block rounded-xl px-3 py-2"
                        >
                          <span className="block text-sm font-semibold text-tinta">{a.titulo}</span>
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
