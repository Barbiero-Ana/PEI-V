import { historicoAvaliacoes } from "@/lib/painel/avaliacoes";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Avatar,
  BarraAcerto,
  ChipResultado,
  Etiqueta,
  LIMITE_ATENCAO,
  corDaTurma,
  dataCurta,
  dataPorExtenso,
  decimal,
  diaDaSemana,
  isoLocal,
  pct,
} from "@/components/painel/blocos";
import { AcessoAluno } from "@/components/painel/acesso-aluno";
import { IconeMais, IconeVoltar } from "@/components/painel/icones";
import { PainelInsights } from "@/components/painel/insights";
import { CORES_PENTAGRAMA, Pentagrama } from "@/components/painel/pentagrama";
import { SituacaoPlano } from "@/components/painel/situacao-plano";
import {
  acessoDoAluno,
  detalheDoAluno,
  listaDeTurmas,
  motivoAtencao,
  pedeAtencao,
  professorLogado,
  avataresDosAlunos,
} from "@/lib/painel/dados";
import { insightsDoAluno } from "@/lib/painel/insights";
import { listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Aluno · Painel do professor · Modolume" };

/** Com menos atividades que isto num formato ou jeito, o valor aparece, mas sem conclusão. */
const MINIMO_ATIVIDADES = 3;

const ABAS = [
  { id: "geral", nome: "Visão geral" },
  { id: "formatos", nome: "Formatos" },
  { id: "atividades", nome: "Atividades" },
  { id: "aulas", nome: "Aulas" },
] as const;

const sinal = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)}`;

export default async function Aluno({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const professor = await professorLogado();
  const avatares = await avataresDosAlunos();
  const { id } = await params;
  const { aba: abaPedida } = await searchParams;
  const [detalhe, turmas, acesso] = await Promise.all([
    detalheDoAluno(professor, id),
    listaDeTurmas(professor),
    acessoDoAluno(id),
  ]);
  if (!detalhe) notFound();

  const { aluno, turma, resumo, porFormato, tendencia, mediaTurma, mediaTurmaPorFormato, periodo, recentes } = detalhe;
  const avaliacoes = await historicoAvaliacoes(id);
  const aba = ABAS.some((a) => a.id === abaPedida) ? abaPedida! : "geral";
  const cor = corDaTurma(turmas.findIndex((t) => t.turma.id === turma.id));
  const planos = (await listarPlanos(professor, { turmaId: turma.id })).filter((p) => p.alunosFoco.includes(aluno.id));
  const hoje = isoLocal(new Date());
  const linha = { atividades: resumo.atividadesAplicadas, acertoMedio: resumo.acertoMedio, tendencia };
  const atencao = pedeAtencao(linha);
  const diferenca = Math.round(resumo.acertoMedio - mediaTurma);

  // pentagrama: jeitos com dados suficientes entram na leitura
  const pontas = detalhe.pontas;
  const insights = insightsDoAluno(
    pontas,
    {
      tentativas: resumo.tentativasMedia,
      conclusao: resumo.conclusaoMedia,
      tendencia,
      nome: aluno.nome,
    },
    detalhe.jeitoPrincipal,
  );

  // leitura organizada em tópicos, cada um com o número por trás
  const leitura: { titulo: string; texto: string; tom?: "alerta" }[] = [
    {
      titulo: "Em relação à turma",
      texto:
        diferenca === 0
          ? `Acerto médio igual ao da turma (${pct(mediaTurma)}).`
          : `${Math.abs(diferenca)} pontos ${diferenca > 0 ? "acima" : "abaixo"} da média da turma (${pct(mediaTurma)}).`,
    },
    {
      titulo: "Evolução",
      texto:
        tendencia >= 5
          ? `Melhorou ${tendencia} pontos entre a primeira e a segunda metade do período.`
          : tendencia <= -5
            ? `Caiu ${Math.abs(tendencia)} pontos entre a primeira e a segunda metade do período.`
            : "Manteve o mesmo nível ao longo do período.",
      tom: tendencia <= -5 ? "alerta" : undefined,
    },
  ];
  if (atencao) leitura.push({ titulo: "Pede atenção", texto: `${motivoAtencao(linha)}.`, tom: "alerta" });

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/professor/turmas/${turma.id}`}
        className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> {turma.nome}
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* perfil: quem é o aluno e os números principais */}
        <aside className="sombra-suave overflow-hidden rounded-2xl bg-superficie lg:sticky lg:top-0">
          <div className={`h-16 ${cor.clara}`} aria-hidden />
          <div className="-mt-10 flex flex-col items-center px-5 text-center">
            <span className="rounded-full bg-superficie p-1.5">
              <Avatar nome={aluno.nome} tamanho={72} svg={avatares[aluno.id]} />
            </span>
            <h1 className="mt-2 text-xl leading-tight">{aluno.nome}</h1>
            <p className="mt-0.5 text-sm text-texto-suave">
              {turma.nome} · {turma.periodo} · matrícula {aluno.codigo}
            </p>
            <div className="mt-2">
              {atencao ? <Etiqueta tom="alerta">Pede atenção</Etiqueta> : <Etiqueta tom="ok">Regular</Etiqueta>}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 border-y border-[#E8E5F3]">
            {[
              {
                r: "Acerto médio",
                v: pct(resumo.acertoMedio),
                d: `turma ${pct(mediaTurma)}`,
                alerta: resumo.acertoMedio < LIMITE_ATENCAO,
              },
              { r: "Variação", v: `${sinal(tendencia)} pts`, d: "no período", alerta: tendencia <= -5 },
              { r: "Atividades", v: String(resumo.atividadesAplicadas), d: `${pct(resumo.conclusaoMedia)} concluídas` },
              { r: "Tentativas", v: decimal(resumo.tentativasMedia), d: "por atividade" },
            ].map((c, i) => (
              <div
                key={c.r}
                className={`px-5 py-4 ${i % 2 === 0 ? "border-r border-[#E8E5F3]" : ""} ${i < 2 ? "border-b border-[#E8E5F3]" : ""}`}
              >
                <dt className="text-xs text-texto-suave">{c.r}</dt>
                <dd
                  className={`tnum mt-0.5 font-display text-2xl font-semibold ${c.alerta ? "text-alerta" : "text-tinta"}`}
                >
                  {c.v}
                </dd>
                <dd className="text-xs text-texto-suave">{c.d}</dd>
              </div>
            ))}
          </dl>

          <AcessoAluno alunoId={aluno.id} acesso={acesso} />

          <div className="flex flex-col gap-2 border-t border-[#E8E5F3] p-5">
            <Link
              href={`/professor/planejamento/novo?turma=${turma.id}&aluno=${aluno.id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-roxo text-sm font-semibold text-white"
            >
              <IconeMais tamanho={16} /> Acompanhar numa aula
            </Link>
            <p className="text-center text-xs text-texto-suave">
              Dados de {dataPorExtenso(periodo.inicio)} a {dataPorExtenso(periodo.fim)}
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <nav aria-label="Seções da ficha" className="flex flex-wrap gap-2">
            {ABAS.map((a) => (
              <Link
                key={a.id}
                href={a.id === "geral" ? `/professor/alunos/${aluno.id}` : `/professor/alunos/${aluno.id}?aba=${a.id}`}
                aria-current={aba === a.id ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${aba === a.id ? "border border-tinta bg-tinta text-white" : "border border-[#D9D4EC] bg-superficie text-tinta"}`}
              >
                {a.nome}
                {a.id === "aulas" && planos.length > 0 ? (
                  <span className="ml-1.5 opacity-70">{planos.length}</span>
                ) : null}
              </Link>
            ))}
          </nav>

          {aba === "geral" ? (
            <>
              <section className="sombra-suave rounded-2xl bg-superficie p-5">
                <h2 className="text-lg">Pentagrama de habilidades</h2>
                <p className="mt-0.5 text-sm text-texto-suave">
                  Acerto em cada jeito de aprender, comparado com a média da turma.
                </p>
                <div className="mt-4 grid items-center gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                  <div className="flex justify-center">
                    <Pentagrama valores={pontas} nomeAluno={aluno.nome} />
                  </div>
                  <div>
                    <ul className="mb-3 flex flex-wrap gap-4 text-xs text-texto">
                      <li className="flex items-center gap-1.5">
                        <span
                          className="h-0.5 w-5 rounded"
                          style={{ background: CORES_PENTAGRAMA.aluno }}
                          aria-hidden
                        />
                        {aluno.nome.split(" ")[0]}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span
                          className="w-5 border-t-2 border-dashed"
                          style={{ borderColor: CORES_PENTAGRAMA.turma }}
                          aria-hidden
                        />
                        Média da turma
                      </li>
                    </ul>
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-texto-suave">
                        <tr>
                          <th className="py-1.5 font-medium">Jeito de aprender</th>
                          <th className="py-1.5 text-right font-medium">Aluno</th>
                          <th className="py-1.5 text-right font-medium">Turma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pontas.map((p) => (
                          <tr key={p.jeito} className="border-t border-[#EEEBF6]">
                            <td className="py-2">
                              <span className="font-semibold text-tinta">{p.jeito}</span>
                              <span className="block text-xs text-texto-suave">
                                {p.formatos.join(", ") || "sem atividades"}
                                {p.aluno !== null && p.confianca !== "boa" ? " · poucos dados" : ""}
                              </span>
                            </td>
                            <td
                              className={`tnum py-2 text-right font-semibold ${p.aluno !== null && p.aluno < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}
                            >
                              {p.aluno === null ? "—" : pct(p.aluno)}
                            </td>
                            <td className="tnum py-2 text-right text-texto">{p.turma === null ? "—" : pct(p.turma)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <PainelInsights
                titulo="Insights para o professor"
                destaque={
                  insights.forte
                    ? {
                        rotulo: "Ponto forte",
                        valor: insights.forte.jeito,
                        detalhe: `${pct(insights.forte.aluno!)} de acerto em ${insights.forte.formatos.join(" e ").toLowerCase()}`,
                      }
                    : null
                }
                dicas={insights.dicas}
                acao={
                  insights.formatosSugeridos.length
                    ? {
                        href: `/professor/planejamento/novo?turma=${turma.id}&aluno=${aluno.id}&formatos=${insights.formatosSugeridos.join(",")}`,
                        rotulo: "Planejar aula com esse jeito",
                      }
                    : undefined
                }
                acaoSecundaria={
                  insights.formatosSugeridos.length
                    ? {
                        href: `/professor/atividades/nova?turma=${turma.id}&formato=${insights.formatosSugeridos.find((f) => ["objetiva", "completar", "associacao-visual", "sequencia"].includes(f)) ?? "pronta"}`,
                        rotulo: "Montar atividade nesse formato",
                      }
                    : undefined
                }
              />

              <section className="sombra-suave rounded-2xl bg-superficie p-5">
                <h2 className="text-lg">Leitura</h2>
                <dl className="mt-3 divide-y divide-[#EEEBF6]">
                  {leitura.map((l) => (
                    <div key={l.titulo} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                      <dt className={`text-sm font-semibold ${l.tom === "alerta" ? "text-alerta" : "text-tinta"}`}>
                        {l.titulo}
                      </dt>
                      <dd className="text-sm leading-relaxed text-texto first-letter:uppercase">{l.texto}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </>
          ) : null}

          {aba === "formatos" ? (
            <section className="sombra-suave rounded-2xl bg-superficie p-5">
              <h2 className="text-lg">Desempenho por formato</h2>
              <p className="mt-0.5 text-sm text-texto-suave">O traço escuro marca a média da turma no mesmo formato.</p>
              <ul className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
                {porFormato.map((f) => {
                  const daTurma = mediaTurmaPorFormato[f.formato] ?? 0;
                  const poucos = f.amostra < MINIMO_ATIVIDADES;
                  const dif = Math.round(f.acertoMedio - daTurma);
                  return (
                    <li key={f.formato}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-semibold text-tinta">{f.rotulo}</span>
                        <span className="tnum shrink-0">
                          <strong className={!poucos && f.acertoMedio < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}>
                            {pct(f.acertoMedio)}
                          </strong>
                          <span className="text-xs text-texto-suave">
                            {" "}
                            · {dif === 0 ? "igual à turma" : `${sinal(dif)} da turma`}
                          </span>
                        </span>
                      </div>
                      <BarraAcerto valor={f.acertoMedio} referencia={daTurma} />
                      <p className="mt-1 text-xs text-texto-suave">
                        {f.amostra} {f.amostra === 1 ? "atividade" : "atividades"}
                        {poucos ? " · poucos dados para concluir" : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {aba === "atividades" ? (
            <section className="sombra-suave rounded-2xl bg-superficie p-5">
              <h2 className="text-lg">Avaliações e devolutivas</h2>
              <ul className="my-4 flex flex-col gap-3">
                {avaliacoes.map((a) => (
                  <li key={a.id} className="border-b border-[#E8E4F2] pb-3">
                    <p className="text-sm font-semibold">
                      {a.atividade.titulo} · {a.publicada ? "Publicada" : "Rascunho"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{a.feedback}</p>
                    <Link
                      href={`/professor/atividades/${a.atividadeId}/alunos/${id}`}
                      className="text-sm text-roxo-escuro"
                    >
                      Abrir avaliação
                    </Link>
                  </li>
                ))}
              </ul>
              {!avaliacoes.length ? (
                <p className="mb-4 text-sm text-texto-suave">Nenhuma avaliação registrada.</p>
              ) : null}
              <h2 className="text-lg">Atividades recentes</h2>
              <ul className="mt-3">
                {[...recentes].reverse().map((r, i) => (
                  <li
                    key={r.id}
                    className={`flex items-center gap-4 rounded-xl px-3 py-2.5 ${i % 2 ? "bg-[#F3F1FA]" : ""}`}
                  >
                    <span className="tnum w-12 text-sm text-texto-suave">{dataCurta(r.data)}</span>
                    <span className="min-w-0 flex-1 text-sm text-tinta">{r.titulo}</span>
                    <ChipResultado valor={r.acerto} titulo={`${Math.round(r.acerto)}% de acerto`} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {aba === "aulas" ? (
            <section className="sombra-suave rounded-2xl bg-superficie p-5">
              <h2 className="text-lg">Aulas com acompanhamento</h2>
              {planos.length === 0 ? (
                <p className="mt-2 text-sm text-texto">Ainda não foi marcado em nenhum plano de aula.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-1">
                  {planos.map((p, i) => (
                    <li key={p.id}>
                      <Link
                        href={`/professor/planejamento/${p.id}`}
                        className={`flex items-center gap-4 rounded-xl px-3 py-2.5 ${i % 2 ? "bg-[#F3F1FA]" : ""}`}
                      >
                        <span className="tnum w-12 shrink-0 leading-tight">
                          <span className="block font-semibold text-tinta">{dataCurta(p.data)}</span>
                          <span className="text-xs text-texto-suave">{diaDaSemana(p.data)}</span>
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-tinta">{p.tema}</span>
                        <SituacaoPlano plano={p} hoje={hoje} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
