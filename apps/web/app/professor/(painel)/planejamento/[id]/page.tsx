import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rotuloFormato } from "@modolume/core";
import { DuplicarPlano, RegistroRapido } from "@/components/painel/acoes-plano";
import {
  Avatar,
  BarraAcerto,
  LIMITE_ATENCAO,
  corDaTurma,
  dataCompleta,
  diaDaSemana,
  isoLocal,
  nomeDoMes,
  pct,
} from "@/components/painel/blocos";
import { IconeVoltar } from "@/components/painel/icones";
import { SituacaoPlano } from "@/components/painel/situacao-plano";
import { opcoesDePlanejamento, professorLogado, avataresDosAlunos } from "@/lib/painel/dados";
import { SOBRE_FORMATOS, listarAtividades } from "@/lib/painel/atividades";
import { HABILIDADES_BNCC, atividadesDoApp, buscarPlano } from "@/lib/painel/planejamento";
import { apagarPlano, mudarStatus } from "../acoes";

export const metadata: Metadata = { title: "Plano de aula · Painel do professor · Modolume" };

/** Bloco de conteúdo do plano: título e linhas rótulo/valor. */
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="sombra-suave rounded-2xl bg-superficie p-5">
      <h2 className="text-lg">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-[#EEEBF6] py-3 first:border-t-0 first:pt-0 sm:grid-cols-[170px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-tinta">{rotulo}</dt>
      <dd className="text-sm leading-relaxed whitespace-pre-line text-texto">{children}</dd>
    </div>
  );
}

const vazio = <span className="text-texto-fraco">Não informado</span>;

export default async function Plano({ params }: { params: Promise<{ id: string }> }) {
  const professor = await professorLogado();
  const avatares = await avataresDosAlunos();
  const { id } = await params;
  const [plano, turmas] = await Promise.all([buscarPlano(professor, id), opcoesDePlanejamento(professor)]);
  if (!plano) notFound();

  const indice = turmas.findIndex((t) => t.id === plano.turmaId);
  const turma = turmas[indice];
  const cor = corDaTurma(indice);
  const alunos = turma?.alunos.filter((a) => plano.alunosFoco.includes(a.id)) ?? [];
  const atividades = atividadesDoApp().filter((a) => plano.atividadesApp.includes(a.id));
  const hoje = isoLocal(new Date());
  const criadas = await listarAtividades(professor, { planoId: plano.id });
  const [, mes, dia] = plano.data.split("-").map(Number);
  const botao = "h-11 w-full rounded-full text-sm font-semibold";

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/professor/planejamento"
        className="inline-flex items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> Planos de aula
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* a aula: quando, para quem e o que fazer com ela */}
        <aside className="sombra-suave overflow-hidden rounded-2xl bg-superficie lg:sticky lg:top-0">
          <div className={`flex items-center gap-4 px-5 py-5 ${cor.clara}`}>
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-superficie text-center leading-none">
              <span>
                <span className={`tnum block font-display text-2xl font-semibold ${cor.texto}`}>{dia}</span>
                <span className="text-[0.7rem] text-texto-suave">{nomeDoMes(mes ?? 1).slice(0, 3)}</span>
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-sm text-texto">
                {diaDaSemana(plano.data).charAt(0).toUpperCase() + diaDaSemana(plano.data).slice(1)}
                {plano.horario ? ` · ${plano.horario}` : ""}
              </p>
              <p className={`font-semibold ${cor.texto}`}>{turma?.nome}</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <h1 className="text-xl leading-snug">{plano.tema}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SituacaoPlano plano={plano} hoje={hoje} />
              <span className="text-xs text-texto-suave">{plano.unidade}</span>
            </div>
          </div>
          <dl className="grid grid-cols-2 border-y border-[#E8E5F3] text-sm">
            <div className="border-r border-[#E8E5F3] px-5 py-3">
              <dt className="text-xs text-texto-suave">Duração</dt>
              <dd className="font-semibold text-tinta">
                {plano.aulas} {plano.aulas === 1 ? "aula" : "aulas"}
              </dd>
            </div>
            <div className="px-5 py-3">
              <dt className="text-xs text-texto-suave">Acompanhamento</dt>
              <dd className="font-semibold text-tinta">{alunos.length} alunos</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2 p-5">
            <Link
              href={`/professor/planejamento/${plano.id}/editar`}
              className={`${botao} inline-flex items-center justify-center bg-tinta text-white`}
            >
              Editar plano
            </Link>
            {plano.status === "realizada" ? (
              <form action={mudarStatus.bind(null, plano.id, "planejada")}>
                <button type="submit" className={`${botao} border border-[#D9D4EC] text-tinta`}>
                  Voltar para planejada
                </button>
              </form>
            ) : null}
            <Link
              href={`/professor/planejamento/novo?base=${plano.id}`}
              className={`${botao} inline-flex items-center justify-center border border-[#D9D4EC] text-tinta`}
            >
              Usar como base para um novo
            </Link>
            <p className="mt-1 text-center text-xs text-texto-suave">
              Última alteração em {dataCompleta(plano.atualizadoEm)}
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <Secao titulo="Registro da aula">
            {plano.data <= hoje ? (
              <RegistroRapido plano={plano} />
            ) : (
              <p className="text-sm text-texto">
                A aula ainda não aconteceu. O registro fica disponível a partir de {dataCompleta(plano.data)}.
              </p>
            )}
          </Secao>

          <Secao titulo="Atividades desta aula no app">
            {criadas.length === 0 ? (
              <p className="text-sm text-texto">Nenhuma atividade montada para esta aula ainda.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {criadas.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/professor/atividades/${a.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#F3F1FA] px-3 py-2.5 text-sm"
                    >
                      <span>
                        <span className="block font-semibold text-tinta">{a.titulo}</span>
                        <span className="text-xs text-texto-suave">
                          {a.formato === "pronta"
                            ? "Atividade pronta do app"
                            : `${SOBRE_FORMATOS[a.formato].nome} · ${a.questoes.length} questões`}
                        </span>
                      </span>
                      <span
                        className={`text-xs font-semibold ${a.status === "enviada" ? "text-[#24704A]" : "text-texto"}`}
                      >
                        {a.status === "enviada" ? "Enviada" : "Rascunho"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/professor/atividades/nova?plano=${plano.id}`}
              className="mt-3 inline-flex h-11 items-center rounded-full border border-dashed border-roxo px-4 text-sm font-semibold text-roxo-escuro"
            >
              Montar atividade para esta aula
            </Link>
          </Secao>

          <Secao titulo="Conteúdo">
            <dl>
              <Linha rotulo="Habilidades da BNCC">
                {plano.habilidades.length === 0
                  ? vazio
                  : plano.habilidades.map((c) => (
                      <span key={c} className="block">
                        <strong className="tnum text-tinta">{c}</strong>{" "}
                        {HABILIDADES_BNCC.find((h) => h.codigo === c)?.resumo}
                      </span>
                    ))}
              </Linha>
              <Linha rotulo="Objetivos">{plano.objetivos || vazio}</Linha>
              <Linha rotulo="Conteúdos">{plano.conteudos || vazio}</Linha>
              <Linha rotulo="Metodologia">{plano.metodologia || vazio}</Linha>
            </dl>
          </Secao>

          <div className="grid gap-5 xl:grid-cols-2">
            <Secao titulo="Formatos e atividades do app">
              {plano.formatos.length === 0 ? (
                <p className="text-sm text-texto-suave">Nenhum formato escolhido.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {plano.formatos.map((f) => {
                    const dado = turma?.formatos[f];
                    return (
                      <li key={f} className="text-sm">
                        <div className="mb-1 flex justify-between gap-2">
                          <span className="font-semibold text-tinta">{rotuloFormato(f)}</span>
                          <span className="tnum text-texto">
                            turma{" "}
                            <strong className={dado && dado.acerto < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}>
                              {dado ? pct(dado.acerto) : "—"}
                            </strong>
                          </span>
                        </div>
                        {dado ? <BarraAcerto valor={dado.acerto} /> : null}
                      </li>
                    );
                  })}
                </ul>
              )}
              {atividades.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2 border-t border-[#EEEBF6] pt-4">
                  {atividades.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#F3F1FA] px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-tinta">{a.titulo}</span>
                      <span className="text-xs text-texto-suave">
                        {a.conteudo} · {rotuloFormato(a.formato)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Secao>

            <Secao titulo="Alunos em acompanhamento">
              {alunos.length === 0 ? (
                <p className="text-sm text-texto-suave">Nenhum aluno marcado.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {alunos.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/professor/alunos/${a.id}`}
                        className="flex items-center gap-3 rounded-xl bg-[#F3F1FA] px-3 py-2"
                      >
                        <Avatar nome={a.nome} tamanho={32} svg={avatares[a.id]} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-tinta">{a.nome}</span>
                          {a.motivo ? <span className="block text-xs text-texto">{a.motivo}</span> : null}
                        </span>
                        <span
                          className={`tnum text-sm font-semibold ${a.acerto < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}
                        >
                          {pct(a.acerto)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Secao>
          </div>

          <Secao titulo="Recursos e avaliação">
            <dl>
              <Linha rotulo="Recursos e materiais">{plano.recursos || vazio}</Linha>
              <Linha rotulo="Avaliação">{plano.avaliacao || vazio}</Linha>
              <Linha rotulo="Observações">{plano.observacoes || vazio}</Linha>
            </dl>
          </Secao>

          <div className="grid gap-5 xl:grid-cols-2">
            <Secao titulo="Duplicar">
              <p className="mb-3 text-sm text-texto">
                Copia o plano para outra turma ou data, como planejado e sem registro.
              </p>
              <DuplicarPlano plano={plano} turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))} />
            </Secao>
            <section className="sombra-suave rounded-2xl bg-superficie p-5">
              <details>
                <summary className="flex min-h-11 cursor-pointer items-center text-lg font-semibold text-tinta">
                  Excluir plano
                </summary>
                <p className="mt-3 text-sm text-texto">O plano será apagado e não pode ser recuperado.</p>
                <form action={apagarPlano.bind(null, plano.id)} className="mt-3">
                  <button
                    type="submit"
                    className="h-11 rounded-full border border-alerta px-4 text-sm font-semibold text-alerta"
                  >
                    Excluir definitivamente
                  </button>
                </form>
              </details>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
