import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Cabecalho, LIMITE_ATENCAO, Variacao, corDaTurma, pct } from "@/components/painel/blocos";
import { IconeBusca } from "@/components/painel/icones";
import { CartaoResumoAluno } from "@/components/painel/cartao-aluno";
import { Filtro, FiltroTurmas, comFiltros } from "@/components/painel/filtros";
import { PreviaAoParar } from "@/components/painel/previa-hover";
import {
  listaDeAlunos,
  listaDeTurmas,
  motivoAtencao,
  pedeAtencao,
  professorLogado,
  avataresDosAlunos,
} from "@/lib/painel/dados";

export const metadata: Metadata = { title: "Alunos · Painel do professor · Modolume" };

/** Compara sem acento e sem diferença de maiúsculas ("julia" acha "Júlia"). */
const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const POR_PAGINA = 20;

type LinhaOrdem = { nome: string; acertoMedio: number; tendencia: number };
const ORDENS: Record<string, { rotulo: string; comparar: (a: LinhaOrdem, b: LinhaOrdem) => number }> = {
  nome: { rotulo: "Nome", comparar: (a, b) => a.nome.localeCompare(b.nome) },
  acerto: { rotulo: "Menor acerto", comparar: (a, b) => a.acertoMedio - b.acertoMedio },
  variacao: { rotulo: "Maior queda", comparar: (a, b) => a.tendencia - b.tendencia },
};

export default async function Alunos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; turma?: string; situacao?: string; ordem?: string; pagina?: string }>;
}) {
  const professor = await professorLogado();
  const avatares = await avataresDosAlunos();
  const pedidos = await searchParams;
  const q = pedidos.q ?? "";
  const situacao = pedidos.situacao === "atencao" ? "atencao" : "";
  const ordem = pedidos.ordem && pedidos.ordem !== "nome" && ORDENS[pedidos.ordem] ? pedidos.ordem : "";
  const [todos, turmas] = await Promise.all([listaDeAlunos(professor), listaDeTurmas(professor)]);
  const indiceTurma = (id: string) => turmas.findIndex((t) => t.turma.id === id);

  const turma = turmas.some((t) => t.turma.id === pedidos.turma) ? pedidos.turma! : "";

  // cada filtro conta considerando os outros filtros já escolhidos
  const busca = todos.filter((a) => !q || normalizar(a.nome).includes(normalizar(q)) || a.codigo.includes(q));
  const daTurma = (id: string) => busca.filter((a) => !id || a.turmaId === id);
  const naSituacao = (lista: typeof busca, s: string) => lista.filter((a) => !s || pedeAtencao(a));
  const filtrados = naSituacao(daTurma(turma), situacao).sort(ORDENS[ordem || "nome"]!.comparar);
  // listas longas em páginas de 20 (MOD-DES-007)
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, Number(pedidos.pagina) || 1));
  const lista = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const atuais = { q, turma, situacao, ordem };
  // mudar qualquer filtro volta para a primeira página
  const link = (mudar: Record<string, string>) => comFiltros("/professor/alunos", atuais, { pagina: "", ...mudar });
  const filtrando = Boolean(q || turma || situacao);

  // a etiqueta da turma só aparece quando a lista mistura turmas
  const comTurma = !turma;
  const resultado = (
    <div>
      {lista.length === 0 ? (
        <p className="px-5 py-6 text-sm text-texto">
          Nenhum aluno com esses filtros. Mude a busca ou use “Limpar filtros”.
        </p>
      ) : (
        <ul className="divide-y divide-[#F0EEF7]">
          {lista.map((a) => {
            const cor = corDaTurma(indiceTurma(a.turmaId));
            const alerta = pedeAtencao(a);
            return (
              <li key={a.alunoId}>
                {/* o resumo abre com o mouse parado 1 s em qualquer ponto da linha do aluno */}
                <PreviaAoParar
                  como="div"
                  className="block"
                  cartao={
                    <CartaoResumoAluno
                      aluno={{
                        ...a,
                        avatarSvg: avatares[a.alunoId],
                        turmaNome: a.turma.nome,
                        rendeMais: a.formatoDestaque?.rotulo,
                        dificuldade: a.dificuldade?.rotulo,
                        motivo: alerta ? motivoAtencao(a) : null,
                      }}
                    />
                  }
                >
                  <Link
                    href={`/professor/alunos/${a.alunoId}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_90px_80px]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar nome={a.nome} tamanho={38} svg={avatares[a.alunoId]} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="block truncate font-semibold text-tinta">{a.nome}</span>
                          {comTurma ? (
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold ${cor.clara} ${cor.texto}`}
                            >
                              {a.turma.nome}
                            </span>
                          ) : null}
                        </span>
                        <span className={`block truncate text-xs ${alerta ? "text-alerta" : "text-texto-suave"}`}>
                          {alerta ? motivoAtencao(a) : `matrícula ${a.codigo}`}
                        </span>
                      </span>
                    </span>
                    <span className="hidden text-sm text-texto md:block">
                      {a.formatoDestaque ? (
                        <>
                          <span className="text-texto-suave">Rende mais em </span>
                          {a.formatoDestaque.rotulo}
                        </>
                      ) : null}
                    </span>
                    <span className="hidden text-right text-sm md:block">
                      <Variacao pontos={a.tendencia} />
                    </span>
                    <span
                      className={`tnum rounded-lg px-2 py-1 text-center text-sm font-semibold ${a.acertoMedio < LIMITE_ATENCAO ? "bg-pessego-claro text-alerta" : "bg-[#F4F3FA] text-tinta"}`}
                    >
                      {pct(a.acertoMedio)}
                    </span>
                  </Link>
                </PreviaAoParar>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Alunos"
        descricao="Acerto médio de cada aluno no período, com a variação e o formato em que rende mais."
      />

      <section aria-label="Filtros" className="sombra-suave flex flex-col gap-4 rounded-2xl bg-superficie p-5">
        <form action="/professor/alunos" className="relative max-w-md">
          <IconeBusca tamanho={16} className="absolute top-3.5 left-3.5 text-texto-suave" />
          {turma ? <input type="hidden" name="turma" value={turma} /> : null}
          {situacao ? <input type="hidden" name="situacao" value={situacao} /> : null}
          {ordem ? <input type="hidden" name="ordem" value={ordem} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome ou matrícula"
            aria-label="Buscar aluno"
            className="h-11 w-full rounded-xl border border-[#D9D4EC] bg-[#FAF9FE] pr-4 pl-10 text-sm text-tinta outline-none focus:border-roxo"
          />
        </form>
        <FiltroTurmas turmas={turmas.map(({ turma: t }) => t)} atual={turma} href={(id) => link({ turma: id })} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Filtro
            rotulo="Situação"
            atual={situacao}
            href={(s) => link({ situacao: s })}
            opcoes={[
              { valor: "", nome: "Todos", n: daTurma(turma).length },
              {
                valor: "atencao",
                nome: "Pedem atenção",
                n: naSituacao(daTurma(turma), "atencao").length,
                tom: "alerta",
              },
            ]}
          />
          <Filtro
            rotulo="Ordenar"
            atual={ordem}
            href={(o) => link({ ordem: o })}
            opcoes={Object.entries(ORDENS).map(([o, { rotulo }]) => ({ valor: o === "nome" ? "" : o, nome: rotulo }))}
          />
        </div>
      </section>

      <section className="sombra-suave rounded-2xl bg-superficie">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EEF7] px-5 py-3">
          <p className="text-sm text-texto" aria-live="polite">
            <strong className="text-tinta">{filtrados.length}</strong> de {todos.length} alunos
            {turma ? ` · ${turmas.find((t) => t.turma.id === turma)?.turma.nome}` : ""}
            {situacao ? " · pedem atenção" : ""}
            {q ? ` · busca “${q}”` : ""}
          </p>
          {filtrando ? (
            <Link
              href="/professor/alunos"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-roxo-escuro"
            >
              Limpar filtros
            </Link>
          ) : null}
        </div>
        {resultado}
        {paginas > 1 ? (
          <nav
            aria-label="Páginas"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EEF7] px-5 py-3 text-sm"
          >
            <span className="text-texto">
              Mostrando {(pagina - 1) * POR_PAGINA + 1} a {Math.min(pagina * POR_PAGINA, filtrados.length)}
            </span>
            <span className="flex gap-2">
              {pagina > 1 ? (
                <Link
                  href={link({ pagina: String(pagina - 1) })}
                  className="inline-flex min-h-11 items-center rounded-xl border border-[#D9D4EC] px-4 font-semibold text-tinta"
                >
                  Anterior
                </Link>
              ) : null}
              <span className="inline-flex min-h-11 items-center px-2 text-texto-suave">
                Página {pagina} de {paginas}
              </span>
              {pagina < paginas ? (
                <Link
                  href={link({ pagina: String(pagina + 1) })}
                  className="inline-flex min-h-11 items-center rounded-xl border border-[#D9D4EC] px-4 font-semibold text-tinta"
                >
                  Próxima
                </Link>
              ) : null}
            </span>
          </nav>
        ) : null}
      </section>
      <p className="-mt-3 text-xs text-texto-suave">A porcentagem é o acerto médio do aluno no período.</p>
    </div>
  );
}
