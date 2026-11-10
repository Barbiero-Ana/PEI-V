"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconeAluno,
  IconeAtividade,
  IconeCalendario,
  IconeDesempenho,
  IconeEquipe,
  IconeEscudo,
  IconeHabilidades,
  IconePlano,
  IconeRegistro,
  IconeTurmas,
  IconeVinculo,
  IconeVisao,
} from "./icones";

/**
 * Seções do painel em dois grupos, com o nome sempre visível: o professor
 * reconhece a seção em vez de lembrar o que cada ícone quer dizer (Nielsen) e
 * escolhe primeiro o grupo, depois a seção (Hick). Cada item ocupa a largura
 * do menu, com pelo menos 44 px de altura, para ser fácil de acertar (Fitts).
 */
/** Cada papel tem a sua área: professor, coordenação e administrador. */
export type Area = "professor" | "coordenacao" | "admin";

const PROFESSOR = [
  {
    nome: null,
    secoes: [{ href: "/professor", nome: "Visão geral", Icone: IconeVisao }],
  },
  {
    nome: "Acompanhar",
    secoes: [
      { href: "/professor/turmas", nome: "Turmas", Icone: IconeTurmas },
      { href: "/professor/alunos", nome: "Alunos", Icone: IconeAluno },
      { href: "/professor/desempenho", nome: "Desempenho", Icone: IconeDesempenho },
      { href: "/professor/habilidades", nome: "Habilidades e insights", Icone: IconeHabilidades },
    ],
  },
  {
    nome: "Planejar",
    secoes: [
      { href: "/professor/planejamento", nome: "Planos de aula", Icone: IconePlano },
      { href: "/professor/planejamento/calendario", nome: "Calendário", Icone: IconeCalendario },
      { href: "/professor/atividades", nome: "Atividades para o app", Icone: IconeAtividade },
    ],
  },
];

/** Coordenação: acompanha a escola e vincula professores; não cria atividades nem planos. */
const COORDENACAO = [
  { nome: null, secoes: [{ href: "/coordenacao", nome: "Visão do segmento", Icone: IconeVisao }] },
  {
    nome: "Acompanhar",
    secoes: [
      { href: "/coordenacao/turmas", nome: "Turmas", Icone: IconeTurmas },
      { href: "/coordenacao/desempenho", nome: "Desempenho por formato", Icone: IconeDesempenho },
    ],
  },
  {
    nome: "Organizar",
    secoes: [{ href: "/coordenacao/vinculos", nome: "Professores e turmas", Icone: IconeVinculo }],
  },
];

/** Administrador: pessoas, papéis, turmas, alunos e o registro de atividades. */
const ADMIN = [
  { nome: null, secoes: [{ href: "/admin", nome: "Visão geral", Icone: IconeVisao }] },
  {
    nome: "Cadastros",
    secoes: [
      { href: "/admin/usuarios", nome: "Equipe e acessos", Icone: IconeEquipe },
      { href: "/admin/turmas", nome: "Turmas e alunos", Icone: IconeTurmas },
      { href: "/admin/materias", nome: "Matérias", Icone: IconePlano },
    ],
  },
  {
    nome: "Segurança",
    secoes: [
      { href: "/admin/permissoes", nome: "Permissões", Icone: IconeEscudo },
      { href: "/admin/registros", nome: "Registro de atividades", Icone: IconeRegistro },
    ],
  },
];

const AREAS = { professor: PROFESSOR, coordenacao: COORDENACAO, admin: ADMIN } as const;

/** A seção ativa é a de caminho mais longo que combina com a página atual. */
export function secaoAtiva(caminho: string, area: Area = "professor") {
  const grupos = AREAS[area];
  const raiz = grupos[0]!.secoes[0]!.href;
  return grupos
    .flatMap((g) => g.secoes.map((s) => s.href as string))
    .filter((h) => caminho === h || (h !== raiz && caminho.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];
}

/** Nome da seção aberta, para o topo no celular. */
export function nomeDaSecao(caminho: string, area: Area = "professor") {
  const ativa = secaoAtiva(caminho, area);
  for (const g of AREAS[area]) for (const s of g.secoes) if (s.href === ativa) return s.nome;
  return "Painel";
}

export type Avisos = Partial<Record<string, { n: number; texto: string }>>;

function Itens({ avisos, area, aoEscolher }: { avisos: Avisos; area: Area; aoEscolher?: () => void }) {
  const ativa = secaoAtiva(usePathname(), area);
  return (
    <div className="flex flex-col gap-5">
      {AREAS[area].map((g) => (
        <div key={g.nome ?? "inicio"}>
          {g.nome ? <p className="mb-1.5 px-3 text-xs font-medium text-white/70">{g.nome}</p> : null}
          <ul className="flex flex-col gap-1">
            {g.secoes.map(({ href, nome, Icone }) => {
              const sel = ativa === href;
              const aviso = avisos[href];
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={aoEscolher}
                    aria-current={sel ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                      sel ? "bg-white text-roxo-escuro" : "text-white hover:bg-white/12"
                    }`}
                  >
                    <Icone tamanho={20} />
                    <span className="min-w-0 flex-1">{nome}</span>
                    {aviso ? (
                      <span
                        title={aviso.texto}
                        className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-pessego px-1.5 text-[0.7rem] font-bold text-tinta"
                      >
                        {aviso.n}
                        <span className="sr-only"> ({aviso.texto})</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Menu fixo na lateral, a partir de telas largas. */
export function MenuLateral({ avisos, area = "professor" }: { avisos: Avisos; area?: Area }) {
  return (
    <nav aria-label="Seções do painel" className="min-h-0 flex-1 overflow-y-auto">
      <Itens avisos={avisos} area={area} />
    </nav>
  );
}

/** No celular e no tablet: o nome da seção aberta e um botão Menu que abre a gaveta com as seções. */
export function MenuCompacto({ avisos, area = "professor" }: { avisos: Avisos; area?: Area }) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const total = Object.values(avisos).reduce((s, a) => s + (a?.n ?? 0), 0);

  useEffect(() => setAberto(false), [caminho]);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  return (
    <>
      <span className="min-w-0 flex-1 truncate font-display text-base font-semibold text-white">
        {nomeDaSecao(caminho, area)}
      </span>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        aria-controls="menu-compacto"
        className="relative flex min-h-11 items-center gap-2 rounded-xl bg-white/12 px-3.5 text-sm font-semibold text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
        Menu
        {total > 0 ? <span className="size-2.5 rounded-full bg-pessego" aria-hidden /> : null}
      </button>
      {aberto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-tinta/40"
          />
          <nav
            id="menu-compacto"
            aria-label="Seções do painel"
            className="gaveta absolute inset-y-0 right-0 flex w-[min(320px,86vw)] flex-col gap-5 overflow-y-auto bg-roxo px-4 py-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-white">Seções</span>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="min-h-11 rounded-xl bg-white/12 px-3.5 text-sm font-semibold text-white"
              >
                Fechar
              </button>
            </div>
            <Itens avisos={avisos} area={area} aoEscolher={() => setAberto(false)} />
          </nav>
        </div>
      ) : null}
    </>
  );
}
