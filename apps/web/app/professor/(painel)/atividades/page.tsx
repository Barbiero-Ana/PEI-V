import type { Metadata } from "next";
import Link from "next/link";
import { Filtro, FiltroTurmas, comFiltros } from "@/components/painel/filtros";
import { BotaoLink, dataCurta, isoLocal } from "@/components/painel/blocos";
import { IconeMais } from "@/components/painel/icones";
import { SOBRE_FORMATOS, listarAtividades, missaoDa } from "@/lib/painel/atividades";
import { listaDeTurmas, professorLogado } from "@/lib/painel/dados";
import { listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Atividades · Painel do professor · Modolume" };

export default async function Atividades({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; turma?: string }>;
}) {
  const professor = await professorLogado();
  const { status = "", turma = "" } = await searchParams;
  const [todas, turmas, planos] = await Promise.all([
    listarAtividades(professor),
    listaDeTurmas(professor),
    listarPlanos(professor),
  ]);
  const naTurma = (t: string) => todas.filter((a) => !t || a.turmas.includes(t));
  const lista = naTurma(turma).filter((a) => !status || a.status === status);
  const link = (mudar: Record<string, string>) => comFiltros("/professor/atividades", { status, turma }, mudar);
  const hoje = isoLocal(new Date());
  const nomeTurma = (id: string) => turmas.find((t) => t.turma.id === id)?.turma.nome ?? "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-tight">Atividades para o app</h1>
          <p className="mt-1 text-sm text-texto-suave">O que cada turma vai fazer no app, e quando.</p>
        </div>
        <BotaoLink href="/professor/atividades/nova">
          <IconeMais tamanho={16} /> Nova atividade
        </BotaoLink>
      </header>

      <div className="sombra-suave flex flex-col gap-3 rounded-2xl bg-superficie p-5">
        <FiltroTurmas turmas={turmas.map(({ turma: t }) => t)} atual={turma} href={(id) => link({ turma: id })} />
        <Filtro
          rotulo="Situação"
          atual={status}
          href={(s) => link({ status: s })}
          opcoes={[
            { valor: "", nome: "Todas", n: naTurma(turma).length },
            { valor: "enviada", nome: "Enviadas", n: naTurma(turma).filter((a) => a.status === "enviada").length },
            { valor: "rascunho", nome: "Rascunhos", n: naTurma(turma).filter((a) => a.status === "rascunho").length },
          ]}
        />
      </div>

      {lista.length === 0 ? (
        <div className="sombra-suave rounded-2xl bg-superficie px-6 py-10 text-center">
          <p className="font-semibold text-tinta">
            {turma || status ? "Nenhuma atividade com esses filtros." : "Nenhuma atividade aqui ainda."}
          </p>
          <p className="mt-1 text-sm text-texto">
            Monte a primeira: uma questão objetiva, de completar, de ligar pares ou de ordenar.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((a) => {
            const plano = planos.find((p) => p.id === a.planoId);
            const enviada = a.status === "enviada";
            const liberada = enviada && a.liberarEm <= hoje;
            return (
              <li key={a.id}>
                <Link
                  href={`/professor/atividades/${a.id}`}
                  className="sombra-suave flex flex-wrap items-center gap-4 rounded-2xl bg-superficie p-4 pr-5"
                >
                  <span className="grid w-16 shrink-0 place-items-center rounded-xl bg-[#F3F1FA] py-2 text-center leading-tight">
                    <span className="tnum font-display text-lg font-semibold text-tinta">
                      {a.formato === "pronta" ? "1" : a.questoes.length}
                    </span>
                    <span className="text-[0.7rem] text-texto-suave">
                      {a.formato === "pronta" ? "jogo" : a.questoes.length === 1 ? "questão" : "questões"}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-tinta">{a.titulo}</span>
                    <span className="mt-0.5 block text-sm text-texto-suave">
                      {a.formato === "pronta"
                        ? `Atividade do app: ${missaoDa(a)?.titulo ?? "—"}`
                        : SOBRE_FORMATOS[a.formato].nome}
                      {a.habilidade ? ` · ${a.habilidade}` : ""}
                      {plano ? ` · aula de ${dataCurta(plano.data)}` : ""}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {a.turmas.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-roxo-claro px-2 py-0.5 text-xs font-semibold text-roxo-escuro"
                      >
                        {nomeTurma(t)}
                      </span>
                    ))}
                  </span>
                  <span className="w-44 text-right text-sm">
                    {enviada ? (
                      <>
                        <span className="block font-semibold text-[#24704A]">{liberada ? "No app" : "Enviada"}</span>
                        <span className="text-xs text-texto-suave">
                          {liberada ? `desde ${dataCurta(a.liberarEm)}` : `libera em ${dataCurta(a.liberarEm)}`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="block font-semibold text-texto">Rascunho</span>
                        <span className="text-xs text-texto-suave">ainda não enviada</span>
                      </>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
