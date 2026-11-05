import type { Metadata } from "next";
import Link from "next/link";
import { Filtro, FiltroTurmas } from "@/components/painel/filtros";
import { GavetaPlano } from "@/components/painel/gaveta-plano";
import { rotuloFormato } from "@modolume/core";
import { BotaoLink, Cabecalho, corDaTurma, diaDaSemana, isoLocal, nomeDoMes } from "@/components/painel/blocos";
import { IconeCalendario, IconeMais } from "@/components/painel/icones";
import { SituacaoPlano } from "@/components/painel/situacao-plano";
import { listaDeTurmas, opcoesDePlanejamento, professorLogado } from "@/lib/painel/dados";
import { ROTULO_STATUS, STATUS_PLANO, listarPlanos, type PlanoAula } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Planos de aula · Painel do professor · Modolume" };

export default async function Planejamento({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; status?: string; plano?: string }>;
}) {
  const professor = await professorLogado();
  const { turma = "", status = "", plano } = await searchParams;
  const [turmas, todos] = await Promise.all([listaDeTurmas(professor), listarPlanos(professor)]);
  const planos = todos.filter((p) => (!turma || p.turmaId === turma) && (!status || p.status === status));
  const indiceTurma = (id: string) => turmas.findIndex((t) => t.turma.id === id);
  const hoje = isoLocal(new Date());

  // agrupa por mês, na ordem das datas
  const meses = new Map<string, PlanoAula[]>();
  for (const p of planos) {
    const chave = p.data.slice(0, 7);
    meses.set(chave, [...(meses.get(chave) ?? []), p]);
  }
  const filtro = (mudar: { turma?: string; status?: string }) => {
    const q = new URLSearchParams({ turma, status, ...mudar });
    for (const [k, val] of [...q.entries()]) if (!val) q.delete(k);
    return `?${q.toString()}`;
  };

  const aberto = plano ? todos.find((x) => x.id === plano) : undefined;
  const opcoes = aberto ? await opcoesDePlanejamento(professor) : [];

  return (
    <>
      <div className="flex flex-col gap-6">
        <Cabecalho
          titulo="Planos de aula"

          acoes={
            <>
              <BotaoLink href="/professor/planejamento/calendario" variante="secundario">
                <IconeCalendario tamanho={16} /> Calendário
              </BotaoLink>
              <BotaoLink href={`/professor/planejamento/novo${turma ? `?turma=${turma}` : ""}`}>
                <IconeMais tamanho={16} /> Novo plano
              </BotaoLink>
            </>
          }
        />

        <div className="sombra-suave flex flex-col gap-3 rounded-2xl bg-superficie p-5">
          <FiltroTurmas turmas={turmas.map(({ turma: t }) => t)} atual={turma} href={(id) => filtro({ turma: id })} />
          <Filtro
            rotulo="Situação"
            atual={status}
            href={(s) => filtro({ status: s })}
            opcoes={["", ...STATUS_PLANO].map((s) => ({
              valor: s,
              nome: s ? ROTULO_STATUS[s as keyof typeof ROTULO_STATUS] : "Todas",
              n: todos.filter((p) => (!turma || p.turmaId === turma) && (!s || p.status === s)).length,
            }))}
          />
        </div>

        {planos.length === 0 ? (
          <p className="sombra-suave rounded-2xl bg-superficie px-5 py-6 text-sm text-texto">
            Nenhum plano com esses filtros. Escolha outra turma ou situação, ou crie um plano novo.
          </p>
        ) : (
          [...meses.entries()].map(([mes, doMes]) => (
            <section key={mes}>
              <h2 className="mb-3 text-lg">
                {nomeDoMes(Number(mes.slice(5)))
                  .charAt(0)
                  .toUpperCase() + nomeDoMes(Number(mes.slice(5))).slice(1)}{" "}
                <span className="font-normal text-texto-suave">{mes.slice(0, 4)}</span>
              </h2>
              <ul className="flex flex-col gap-2.5">
                {doMes.map((p) => {
                  const cor = corDaTurma(indiceTurma(p.turmaId));
                  const passou = p.data < hoje;
                  return (
                    <li key={p.id}>
                      <Link
                        href={`${filtro({})}&plano=${p.id}`}
                        scroll={false}
                        className={`sombra-suave flex items-center gap-4 rounded-2xl bg-superficie p-3 pr-5 ${passou && p.status === "realizada" ? "opacity-70" : ""}`}
                      >
                        <span
                          className={`grid w-16 shrink-0 place-items-center rounded-xl py-2 leading-tight ${cor.clara}`}
                        >
                          <span className={`tnum font-display text-2xl font-semibold ${cor.texto}`}>
                            {Number(p.data.slice(8))}
                          </span>
                          <span className="text-xs text-texto-suave">{diaDaSemana(p.data)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-tinta">{p.tema}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold ${cor.clara} ${cor.texto}`}
                            >
                              {turmas[indiceTurma(p.turmaId)]?.turma.nome}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-texto-suave">
                            {[
                              p.horario,
                              `${p.aulas} ${p.aulas === 1 ? "aula" : "aulas"}`,
                              p.habilidades.join(", "),
                              p.formatos.map((f) => rotuloFormato(f)).join(", "),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        {p.alunosFoco.length > 0 ? (
                          <span className="hidden text-sm text-texto md:block">
                            {p.alunosFoco.length} em acompanhamento
                          </span>
                        ) : null}
                        <SituacaoPlano plano={p} hoje={hoje} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}

        <p className="text-xs text-texto-suave">
          Enquanto o painel usa dados de demonstração, os planos ficam guardados só no servidor e voltam aos exemplos
          quando ele reinicia.
        </p>
      </div>
      {aberto ? (
        <GavetaPlano plano={aberto} turmas={opcoes} fecharHref={filtro({})} hoje={isoLocal(new Date())} />
      ) : null}
    </>
  );
}
