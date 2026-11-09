import type { Metadata } from "next";
import Link from "next/link";
import { CartaoResumoAluno } from "@/components/painel/cartao-aluno";
import { GavetaPlano } from "@/components/painel/gaveta-plano";
import { PreviaAoParar } from "@/components/painel/previa-hover";
import {
  Avatar,
  BarraAcerto,
  BotaoLink,
  LIMITE_ATENCAO,
  corDaTurma,
  dataPorExtenso,
  diaDaSemana,
  diasDaSemanaLetiva,
  isoLocal,
  pct,
} from "@/components/painel/blocos";
import { IconeAtividade, IconeMais, IconeSeta } from "@/components/painel/icones";
import {
  listaDeTurmas,
  motivoAtencao,
  opcoesDePlanejamento,
  professorLogado,
  visaoGeral,
  avataresDosAlunos,
} from "@/lib/painel/dados";
import { listarAtividades } from "@/lib/painel/atividades";
import { ROTULO_SITUACAO, listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Visão geral · Painel do professor · Modolume" };

const saudacao = (h: number) => (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite");

export default async function VisaoGeral({ searchParams }: { searchParams: Promise<{ plano?: string }> }) {
  const { plano } = await searchParams;
  const professor = await professorLogado();
  const avatares = await avataresDosAlunos();
  const [{ resumo, periodo, formatos, atencao }, turmas, planos, atividades] = await Promise.all([
    visaoGeral(professor),
    listaDeTurmas(professor),
    listarPlanos(professor),
    listarAtividades(professor),
  ]);
  const agora = new Date();
  const hoje = isoLocal(agora);
  const semana = diasDaSemanaLetiva(agora);
  const indiceTurma = (id: string) => turmas.findIndex((t) => t.turma.id === id);
  const nomeTurma = (id: string) => turmas[indiceTurma(id)]?.turma.nome ?? "";
  const semRegistro = planos.filter((p) => p.data < hoje && p.status !== "realizada");
  const primeiroNome = professor.nome.replace(/^Prof\.ª?\s*/, "").split(" ")[0];
  const dataHoje = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(agora);

  const aberto = plano ? planos.find((x) => x.id === plano) : undefined;
  const opcoes = aberto ? await opcoesDePlanejamento(professor) : [];

  return (
    <>
      <div className="flex flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-roxo-escuro">
              {dataHoje.charAt(0).toUpperCase() + dataHoje.slice(1)}
            </p>
            <h1 className="mt-1 text-[2rem] leading-tight">
              {saudacao(agora.getHours())}, {primeiroNome}
            </h1>
          </div>
          <BotaoLink href="/professor/planejamento/novo">
            <IconeMais tamanho={16} /> Novo plano de aula
          </BotaoLink>
        </header>

        {/* agenda da semana: o que o professor tem pela frente */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg">Esta semana</h2>
            <Link
              href="/professor/planejamento/calendario"
              className="inline-flex min-h-11 items-center gap-0.5 text-sm font-semibold text-roxo-escuro"
            >
              Calendário <IconeSeta tamanho={14} />
            </Link>
          </div>

          {semRegistro.length > 0 ? (
            <Link
              href={`/professor/planejamento/${semRegistro[semRegistro.length - 1]!.id}`}
              className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-pessego-claro px-4 py-3 text-sm text-tinta"
            >
              <span>
                <strong>
                  {semRegistro.length} {semRegistro.length === 1 ? "aula já passou" : "aulas já passaram"} sem registro.
                </strong>{" "}
                Conte como foi para manter o histórico da turma.
              </span>
              <IconeSeta tamanho={16} />
            </Link>
          ) : null}

          {/* a semana numa só faixa, um dia por coluna */}
          <ol className="sombra-suave grid divide-y divide-[#E8E5F3] rounded-2xl bg-superficie lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {semana.map((dia) => {
              const aulas = planos.filter((p) => p.data === dia);
              const ehHoje = dia === hoje;
              const passou = dia < hoje;
              return (
                <li
                  key={dia}
                  className={`flex-col gap-3 px-4 py-4 ${passou && aulas.length === 0 ? "hidden lg:flex" : "flex"} ${ehHoje ? "bg-[#F7F5FF]" : ""} first:rounded-t-2xl last:rounded-b-2xl lg:first:rounded-l-2xl lg:first:rounded-tr-none lg:last:rounded-r-2xl lg:last:rounded-bl-none`}
                >
                  <p className="flex items-center gap-2.5">
                    <span
                      className={`tnum grid size-9 place-items-center rounded-full font-display text-base font-semibold ${ehHoje ? "bg-roxo-escuro text-white" : passou ? "text-texto-fraco" : "bg-[#F1EFF8] text-tinta"}`}
                    >
                      {Number(dia.slice(8))}
                    </span>
                    <span
                      className={`text-sm ${ehHoje ? "font-semibold text-roxo-escuro" : passou ? "text-texto-fraco" : "text-texto"}`}
                    >
                      {ehHoje ? "Hoje" : diaDaSemana(dia).charAt(0).toUpperCase() + diaDaSemana(dia).slice(1)}
                    </span>
                  </p>
                  {aulas.length > 0 ? (
                    <ul className="flex flex-col gap-3">
                      {aulas.map((p) => {
                        const cor = corDaTurma(indiceTurma(p.turmaId));
                        return (
                          <li key={p.id}>
                            <Link
                              href={`?plano=${p.id}`}
                              scroll={false}
                              className={`block min-h-11 ${passou ? "opacity-70" : ""}`}
                            >
                              <span className="flex items-center gap-1.5 text-xs text-texto">
                                <span className={`size-2 rounded-full ${cor.solida}`} aria-hidden />
                                <span className="tnum font-semibold text-tinta">{p.horario || "—"}</span>
                                {nomeTurma(p.turmaId)}
                              </span>
                              <span className="mt-0.5 block text-sm leading-snug font-semibold text-tinta underline-offset-2">
                                {p.tema}
                              </span>
                              {p.status !== "planejada" ? (
                                <span className="text-xs text-texto-suave">{ROTULO_SITUACAO[p.status]}</span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-texto-suave">
                      Sem aulas.{" "}
                      {!passou ? (
                        <Link
                          href={`/professor/planejamento/novo?data=${dia}`}
                          className="font-semibold text-roxo-escuro"
                        >
                          Planejar
                        </Link>
                      ) : null}
                    </p>
                  )}
                  {/* atividades que entram no app neste dia: só um contador, que abre a lista */}
                  {(() => {
                    const doDia = atividades.filter((a) => a.status === "enviada" && a.liberarEm === dia);
                    if (doDia.length === 0) return null;
                    return (
                      <details className="group mt-auto">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-roxo-escuro">
                          <IconeAtividade tamanho={15} />
                          {doDia.length} {doDia.length === 1 ? "atividade no app" : "atividades no app"}
                          <IconeSeta tamanho={13} className="transition-transform group-open:rotate-90" />
                        </summary>
                        <ul className="mt-2 flex flex-col gap-1.5 pl-[21px]">
                          {doDia.map((a) => (
                            <li key={a.id}>
                              <Link
                                href={`/professor/atividades/${a.id}`}
                                className="block text-sm leading-snug text-tinta"
                              >
                                {a.titulo}
                                <span className="text-xs text-texto-suave">
                                  {" "}
                                  · {a.turmas.map(nomeTurma).join(", ")}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    );
                  })()}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* alunos que pedem atenção, com o motivo */}
          <section className="sombra-suave rounded-2xl bg-superficie p-5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="text-lg">Pedem atenção</h2>
              <Link
                href="/professor/alunos?situacao=atencao"
                className="inline-flex min-h-11 items-center gap-0.5 text-sm font-semibold text-roxo-escuro"
              >
                Ver alunos <IconeSeta tamanho={14} />
              </Link>
            </div>
            {atencao.length === 0 ? (
              <p className="py-2 text-sm text-texto">Nenhum aluno abaixo de 60% ou em queda no período.</p>
            ) : (
              <ul className="divide-y divide-[#F0EEF7]">
                {atencao.map((a) => (
                  <li key={a.alunoId}>
                    <PreviaAoParar
                      como="div"
                      className="block"
                      cartao={
                        <CartaoResumoAluno
                          aluno={{
                            ...a,
                            avatarSvg: avatares[a.alunoId],
                            turmaNome: nomeTurma(a.turmaId),
                            rendeMais: a.formatoDestaque?.rotulo,
                            motivo: motivoAtencao(a),
                          }}
                        />
                      }
                    >
                      <Link href={`/professor/alunos/${a.alunoId}`} className="flex items-center gap-3 py-3">
                        <Avatar nome={a.nome} tamanho={38} svg={avatares[a.alunoId]} />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 text-sm font-semibold text-tinta">
                            <span className="truncate">{a.nome}</span>
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold ${corDaTurma(indiceTurma(a.turmaId)).clara} ${corDaTurma(indiceTurma(a.turmaId)).texto}`}
                            >
                              {nomeTurma(a.turmaId)}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-texto-suave">{motivoAtencao(a)}</p>
                        </div>
                        <span
                          className={`tnum rounded-lg px-2.5 py-1 text-sm font-semibold ${a.acertoMedio < LIMITE_ATENCAO ? "bg-pessego-claro text-alerta" : "bg-roxo-claro text-tinta"}`}
                        >
                          {pct(a.acertoMedio)}
                        </span>
                      </Link>
                    </PreviaAoParar>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* turmas */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg">Suas turmas</h2>
              <Link
                href="/professor/turmas"
                className="inline-flex min-h-11 items-center gap-0.5 text-sm font-semibold text-roxo-escuro"
              >
                Ver turmas <IconeSeta tamanho={14} />
              </Link>
            </div>
            {turmas.map(({ turma, alunos, resumo: r, piorFormato, atencao: n, metas }, i) => {
              const cor = corDaTurma(i);
              const proxima = planos.find((p) => p.turmaId === turma.id && p.data >= hoje);
              return (
                <Link
                  key={turma.id}
                  href={`/professor/turmas/${turma.id}`}
                  className="sombra-suave overflow-hidden rounded-2xl bg-superficie"
                >
                  <div className={`flex items-center justify-between gap-4 px-5 py-4 ${cor.clara}`}>
                    <div>
                      <p className="font-display text-xl font-semibold text-tinta">{turma.nome}</p>
                      <p className="text-sm text-texto">
                        {alunos} alunos · {turma.periodo}
                      </p>
                    </div>
                    <p className="text-right">
                      <span className={`tnum block font-display text-3xl font-semibold ${cor.texto}`}>
                        {pct(r.acertoMedio)}
                      </span>
                      <span className="text-xs text-texto-suave">acerto médio</span>
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 px-5 py-4 text-sm">
                    <div>
                      <dt className="text-xs text-texto-suave">Pedem atenção</dt>
                      <dd className={`mt-0.5 font-semibold ${n > 0 ? "text-alerta" : "text-tinta"}`}>
                        {n} {n === 1 ? "aluno" : "alunos"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-texto-suave">Menos acerto em</dt>
                      <dd className="mt-0.5 font-semibold text-tinta">
                        {piorFormato ? `${piorFormato.rotulo} (${pct(piorFormato.acertoMedio)})` : "—"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-texto-suave">Metas das últimas 4 semanas</dt>
                      <dd className="mt-0.5 font-semibold text-tinta">
                        {metas.atingidas} de {metas.indicadores.length} atingidas
                        {metas.indicadores.some((m) => m.status === "abaixo") ? (
                          <span className="font-normal text-alerta">
                            {" "}
                            · {metas.indicadores.filter((m) => m.status === "abaixo").length} abaixo da meta
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-texto-suave">Próxima aula</dt>
                      <dd className="mt-0.5 font-semibold text-tinta">
                        {proxima ? `${dataPorExtenso(proxima.data)} · ${proxima.tema}` : "Nenhuma planejada"}
                      </dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </section>
        </div>

        <section className="sombra-suave rounded-2xl bg-superficie p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="text-lg">Acerto por formato de atividade</h2>
            <p className="text-sm text-texto-suave">
              {resumo.atividadesAplicadas} atividades entre {dataPorExtenso(periodo.inicio)} e{" "}
              {dataPorExtenso(periodo.fim)} · média geral {pct(resumo.acertoMedio)}
            </p>
          </div>
          <ul className="mt-4 grid gap-x-10 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {formatos.map((f) => (
              <li key={f.formato} className="text-sm">
                <div className="mb-1 flex justify-between gap-2">
                  <span className="truncate text-texto">{f.rotulo}</span>
                  <span className="tnum shrink-0">
                    <strong className={f.acertoMedio < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}>
                      {pct(f.acertoMedio)}
                    </strong>
                    <span className="text-xs text-texto-suave"> · {f.amostra}</span>
                  </span>
                </div>
                <BarraAcerto valor={f.acertoMedio} />
              </li>
            ))}
          </ul>
        </section>
      </div>
      {aberto ? (
        <GavetaPlano plano={aberto} turmas={opcoes} fecharHref={"/professor"} hoje={isoLocal(new Date())} />
      ) : null}
    </>
  );
}
