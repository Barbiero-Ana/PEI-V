import type { ReactNode } from "react";
import { Simbolo } from "@/components/simbolo";
import { AlertasDoDia } from "@/components/painel/alertas";
import { MenuCompacto, MenuLateral, type Avisos } from "@/components/painel/menu";
import { Avatar, isoLocal } from "@/components/painel/blocos";
import { IconeSair } from "@/components/painel/icones";
import { escolaDoProfessor, professorLogado, visaoGeral } from "@/lib/painel/dados";
import { alertasDoDia } from "@/lib/painel/alertas";
import { listarPlanos } from "@/lib/painel/planejamento";

/**
 * Estrutura do painel em tela cheia: menu roxo à esquerda, com o nome de cada
 * seção visível, barra superior e o conteúdo, que é a única parte que rola.
 * Em telas estreitas, o menu vira uma gaveta aberta pelo botão Menu.
 */
export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const professor = await professorLogado();
  const [escola, { atencao }, planos, alertas] = await Promise.all([
    escolaDoProfessor(professor),
    visaoGeral(professor),
    listarPlanos(professor),
    alertasDoDia(professor),
  ]);
  const hoje = isoLocal(new Date());
  const semRegistro = planos.filter((p) => p.data < hoje && p.status !== "realizada").length;

  // contadores ao lado do nome da seção
  const avisos: Avisos = {};
  if (atencao.length > 0) avisos["/professor/alunos"] = { n: atencao.length, texto: `${atencao.length} pedem atenção` };
  if (semRegistro > 0)
    avisos["/professor/planejamento"] = { n: semRegistro, texto: `${semRegistro} aulas sem registro` };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-tinta focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <div className="min-h-screen bg-[#F1EFF8] lg:flex lg:h-full lg:min-h-0 lg:overflow-hidden">
        {/* celular e tablet: faixa no topo com a seção atual e o botão Menu */}
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-roxo px-4 py-2.5 lg:hidden">
          <span className="grid size-10 shrink-0 place-items-center">
            <Simbolo tamanho={32} rotulo="Modolume" cor="#FFFFFF" />
          </span>
          <MenuCompacto avisos={avisos} />
        </div>

        {/* telas largas: menu fixo com nomes */}
        <aside className="hidden w-[248px] shrink-0 flex-col gap-6 bg-roxo px-3 py-5 lg:flex">
          <div className="flex items-center gap-2.5 px-2">
            <Simbolo tamanho={34} rotulo="Modolume" cor="#FFFFFF" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold text-white">Modolume</span>
              <span className="block truncate text-xs text-white/75">{escola?.nome ?? "Painel do professor"}</span>
            </span>
          </div>
          <MenuLateral avisos={avisos} />
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
            <AlertasDoDia key={professor.id} alertas={alertas} professorId={professor.id} />
            <span className="flex items-center gap-2.5 rounded-full bg-[#F3F1FA] py-1 pr-4 pl-1">
              <Avatar nome={professor.nome} tamanho={32} tom="escuro" />
              <span className="hidden text-sm font-semibold text-tinta sm:block">{professor.nome}</span>
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

          {/* só o conteúdo rola; o menu e a barra superior ficam fixos. "relative" mantém
              dentro da rolagem os elementos de posição absoluta (como os textos só para
              leitor de tela); sem isso, eles esticavam a página e criavam uma segunda barra */}
          <main id="conteudo" className="relative w-full min-w-0 flex-1 px-5 py-7 lg:overflow-y-auto lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
