import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Avatar,
  BarraAcerto,
  ChipResultado,
  LIMITE_ATENCAO,
  LegendaFaixas,
  Variacao,
  dataCurta,
  dataPorExtenso,
  decimal,
  diaDaSemana,
  isoLocal,
  pct,
} from "@/components/painel/blocos";
import { BannerTurma } from "@/components/painel/banner-turma";
import { IconeBusca, IconeInfo, IconeMais, IconeSeta } from "@/components/painel/icones";
import { FiltroTurmas } from "@/components/painel/filtros";
import { IndicadoresSmart } from "@/components/painel/indicadores-smart";
import { CartaoResumoAluno } from "@/components/painel/cartao-aluno";
import { Pastas } from "@/components/painel/pastas";
import { PreviaAoParar } from "@/components/painel/previa-hover";
import { SituacaoPlano } from "@/components/painel/situacao-plano";
import {
  detalheDaTurma,
  listaDeTurmas,
  motivoAtencao,
  pedeAtencao,
  professorLogado,
  avataresDosAlunos,
} from "@/lib/painel/dados";
import { listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Turma · Painel do professor · Modolume" };

/** Seções da turma, no painel ao lado (como abas). */
const ABAS = [
  { id: "diario", nome: "Diário", descricao: "Resultado de cada aluno nas últimas atividades" },
  { id: "metas", nome: "Metas", descricao: "Indicadores SMART: meta, período e o que fazer" },
  { id: "formatos", nome: "Formatos de atividade", descricao: "Em que tipo de atividade a turma acerta mais" },
  { id: "aulas", nome: "Aulas", descricao: "Planos de aula e registros desta turma" },
  { id: "sobre", nome: "Sobre a turma", descricao: "Série, turno, período e números gerais" },
] as const;

type Linha = { nome: string; acertoMedio: number; tendencia: number };
const ORDENS: Record<string, { rotulo: string; comparar: (a: Linha, b: Linha) => number }> = {
  nome: { rotulo: "Nome", comparar: (a, b) => a.nome.localeCompare(b.nome) },
  acerto: { rotulo: "Menor acerto", comparar: (a, b) => a.acertoMedio - b.acertoMedio },
  variacao: { rotulo: "Maior queda", comparar: (a, b) => a.tendencia - b.tendencia },
};

/** Tons suaves de cada turma (fundo e texto), na ordem das turmas. */
const TONS = [
  { fundo: "bg-[#EFEBFF]", texto: "text-roxo-escuro" },
  { fundo: "bg-[#E4F3FC]", texto: "text-[#1F6E9F]" },
  { fundo: "bg-[#FFF1E7]", texto: "text-alerta" },
];
const tom = (i: number) => TONS[Math.max(0, i) % TONS.length]!;

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default async function Turma({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ordem?: string; aba?: string; q?: string }>;
}) {
  const professor = await professorLogado();
  const avatares = await avataresDosAlunos();
  const { id } = await params;
  const { ordem: pedida, aba: abaPedida, q = "" } = await searchParams;
  const [detalhe, turmas, planos] = await Promise.all([
    detalheDaTurma(professor, id),
    listaDeTurmas(professor),
    listarPlanos(professor, { turmaId: id }),
  ]);
  if (!detalhe) notFound();

  const { turma, resumo, formatos, alunos, periodo, metas } = detalhe;
  const metasAbaixo = metas.indicadores.filter((i) => i.status === "abaixo").length;
  const indice = turmas.findIndex((t) => t.turma.id === turma.id);
  const aba = ABAS.some((a) => a.id === abaPedida) ? abaPedida! : "diario";
  const ordem = pedida && ORDENS[pedida] ? pedida : "nome";
  const lista = [...alunos]
    .filter((a) => !q || normalizar(a.nome).includes(normalizar(q)))
    .sort(ORDENS[ordem]!.comparar);
  const atencao = alunos.filter(pedeAtencao).length;
  const hoje = isoLocal(new Date());
  const primeiroNome = professor.nome.replace(/^Prof\.ª?\s*/, "");
  const link = (mudar: Record<string, string>) => {
    const p = new URLSearchParams({ aba, ordem, q, ...mudar });
    if (p.get("aba") === "diario") p.delete("aba");
    if (p.get("ordem") === "nome") p.delete("ordem");
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    return `/professor/turmas/${turma.id}?${p.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* trilha, busca de aluno e troca de turma */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <p className="text-xs text-texto-suave lg:col-span-2">
          <Link href="/professor">Visão geral</Link> <span className="text-texto-fraco">/</span> Turmas{" "}
          <span className="text-texto-fraco">/</span> <span className="font-semibold text-tinta">{turma.nome}</span>
        </p>

        <form action={`/professor/turmas/${turma.id}`} className="relative max-w-md">
          <IconeBusca tamanho={16} className="absolute top-3.5 left-3.5 text-texto-suave" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar aluno na turma"
            aria-label="Buscar aluno na turma"
            className="h-11 w-full rounded-xl border border-[#D9D4EC] bg-[#FAF9FE] pr-3 pl-10 text-sm text-tinta outline-none focus:border-roxo"
          />
        </form>

        <FiltroTurmas
          turmas={turmas.map(({ turma: t }) => t)}
          atual={turma.id}
          todas={false}
          href={(id) => `/professor/turmas/${id}`}
        />
      </div>

      {/* conteúdo da turma */}
      <div className="flex min-w-0 flex-col gap-6">
        <section className="overflow-hidden rounded-2xl bg-superficie sombra-suave">
          <div className="relative h-36 sm:h-44">
            <BannerTurma indice={indice} />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-white/85 px-5 py-2.5">
              <span className="flex items-center gap-2.5">
                <Avatar nome={professor.nome} tamanho={28} tom="escuro" />
                <span className="leading-tight">
                  <span className="block text-[0.7rem] text-texto-suave">Responsável</span>
                  <span className="text-xs font-semibold text-tinta">{primeiroNome}</span>
                </span>
              </span>
              <Link
                href={`/professor/planejamento?turma=${turma.id}`}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-tinta"
              >
                Planos da turma
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5">
            <div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tom(indice).fundo} ${tom(indice).texto}`}
              >
                {turma.serie} · {turma.periodo}
              </span>
              <h1 className="mt-2 text-[1.9rem] leading-tight">{turma.nome}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex -space-x-2">
                  {alunos.slice(0, 3).map((a) => (
                    <span key={a.alunoId} className="rounded-full ring-2 ring-white">
                      <Avatar nome={a.nome} tamanho={28} svg={avatares[a.alunoId]} />
                    </span>
                  ))}
                  <span className="grid size-7 place-items-center rounded-full bg-roxo text-[0.65rem] font-bold text-white ring-2 ring-white">
                    +{Math.max(0, alunos.length - 3)}
                  </span>
                </span>
                <span className="text-sm text-texto">
                  {alunos.length} alunos
                  {atencao > 0 ? (
                    <span className="text-alerta">
                      {" "}
                      · {atencao} {atencao === 1 ? "pede" : "pedem"} atenção
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-right">
                <span className="tnum block font-display text-3xl font-semibold text-tinta">
                  {pct(resumo.acertoMedio)}
                </span>
                <span className="text-xs text-texto-suave">acerto médio</span>
              </p>
              <Link
                href={`/professor/planejamento/novo?turma=${turma.id}`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-roxo-escuro px-4 text-sm font-semibold text-white"
              >
                <IconeMais tamanho={16} /> Planejar aula
              </Link>
            </div>
          </div>
        </section>

        <Pastas
          inicial={aba}
          rotulo="Seções da turma"
          abas={ABAS.map((a) => ({
            ...a,
            ...(a.id === "diario" ? { contagem: alunos.length } : {}),
            ...(a.id === "metas"
              ? {
                  descricao: `${metas.atingidas} de ${metas.indicadores.length} atingidas${metasAbaixo > 0 ? ` · ${metasAbaixo} abaixo da meta` : ""}`,
                  tom: metasAbaixo > 0 ? ("alerta" as const) : undefined,
                }
              : {}),
            ...(a.id === "formatos" ? { contagem: formatos.length } : {}),
            ...(a.id === "aulas" ? { contagem: planos.length } : {}),
          }))}
          paineis={{
            diario: (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg">
                    Diário da turma
                    {q ? <span className="ml-2 text-sm font-normal text-texto-suave">busca: “{q}”</span> : null}
                  </h2>
                  <div className="flex items-center gap-1 text-sm">
                    {Object.entries(ORDENS).map(([o, { rotulo }]) => (
                      <Link
                        key={o}
                        href={link({ ordem: o, aba: "diario" })}
                        aria-current={o === ordem ? "true" : undefined}
                        className={`inline-flex min-h-11 items-center rounded-full px-3.5 font-medium ${o === ordem ? "border border-roxo/40 bg-roxo-claro text-roxo-escuro" : "border border-[#D9D4EC] text-tinta"}`}
                      >
                        {rotulo}
                      </Link>
                    ))}
                  </div>
                </div>
                {lista.length === 0 ? (
                  <p className="py-4 text-sm text-texto">Nenhum aluno encontrado.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {lista.map((a, i) => {
                      const alerta = pedeAtencao(a);
                      return (
                        <li key={a.alunoId}>
                          {/* o resumo abre com o mouse parado 1 s em qualquer ponto da linha do aluno */}
                          <PreviaAoParar
                            como="div"
                            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_auto_64px_64px_44px] ${i % 2 ? "bg-[#F3F1FA]" : ""}`}
                            cartao={
                              <CartaoResumoAluno
                                aluno={{
                                  ...a,
                                  avatarSvg: avatares[a.alunoId],
                                  turmaNome: turma.nome,
                                  rendeMais: a.formatoDestaque?.rotulo,
                                  dificuldade: a.dificuldade?.rotulo,
                                  motivo: alerta ? motivoAtencao(a) : null,
                                }}
                              />
                            }
                          >
                            <Link
                              href={`/professor/alunos/${a.alunoId}`}
                              className="flex min-h-11 min-w-0 items-center gap-3"
                            >
                              <Avatar nome={a.nome} tamanho={36} svg={avatares[a.alunoId]} />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-tinta">{a.nome}</span>
                                <span
                                  className={`block truncate text-xs ${alerta ? "text-alerta" : "text-texto-suave"}`}
                                >
                                  {alerta ? motivoAtencao(a) : `matrícula ${a.codigo}`}
                                </span>
                              </span>
                            </Link>
                            <div className="col-span-2 row-start-2 flex gap-1 md:col-span-1 md:row-start-auto">
                              {a.recentes.map((r) => (
                                <ChipResultado
                                  key={r.id}
                                  valor={r.acerto}
                                  titulo={`${r.titulo} · ${dataCurta(r.data)} · ${Math.round(r.acerto)}%`}
                                />
                              ))}
                            </div>
                            <span className="hidden text-right text-sm md:block">
                              <Variacao pontos={a.tendencia} />
                            </span>
                            <span
                              className={`tnum col-start-2 row-start-1 text-right text-sm font-semibold md:col-start-auto md:row-start-auto ${a.acertoMedio < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}
                            >
                              {pct(a.acertoMedio)}
                            </span>
                            <Link
                              href={`/professor/alunos/${a.alunoId}`}
                              title={`Ficha de ${a.nome}`}
                              className="hidden size-11 place-items-center rounded-full text-texto-suave md:grid"
                            >
                              <IconeInfo />
                              <span className="sr-only">Ficha de {a.nome}</span>
                            </Link>
                          </PreviaAoParar>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0EEF7] pt-3">
                  <LegendaFaixas />
                  <p className="text-xs text-texto-suave">
                    Quadrados: acerto nas últimas atividades, da mais antiga à mais recente.
                  </p>
                </div>
              </>
            ),
            metas: <IndicadoresSmart painel={metas} turmaId={turma.id} />,
            formatos: (
              <>
                <h2 className="text-lg">Formatos de atividade</h2>
                <p className="mt-0.5 text-sm text-texto-suave">
                  Acerto médio da turma em cada formato, com o total de resultados por trás de cada número.
                </p>
                <ul className="mt-5 grid gap-x-10 gap-y-4 md:grid-cols-2">
                  {formatos.map((f) => (
                    <li key={f.formato} className="text-sm">
                      <div className="mb-1.5 flex justify-between gap-2">
                        <span className="text-tinta">{f.rotulo}</span>
                        <span className="tnum">
                          <strong className={f.acertoMedio < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}>
                            {pct(f.acertoMedio)}
                          </strong>
                          <span className="text-xs text-texto-suave"> · {f.amostra} resultados</span>
                        </span>
                      </div>
                      <BarraAcerto valor={f.acertoMedio} />
                    </li>
                  ))}
                </ul>
              </>
            ),
            aulas: (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg">Aulas</h2>
                  <Link
                    href={`/professor/planejamento/novo?turma=${turma.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-roxo-escuro"
                  >
                    <IconeMais tamanho={15} /> Novo plano
                  </Link>
                </div>
                {planos.length === 0 ? (
                  <p className="mt-3 text-sm text-texto">Nenhum plano para esta turma ainda.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-1">
                    {planos.map((p, i) => (
                      <li key={p.id}>
                        <Link
                          href={`/professor/planejamento/${p.id}`}
                          className={`flex items-center gap-4 rounded-xl px-3 py-2.5 ${i % 2 ? "bg-[#F3F1FA]" : ""}`}
                        >
                          <span className="tnum w-12 shrink-0 text-center leading-tight">
                            <span className="block font-display text-lg font-semibold text-tinta">
                              {dataCurta(p.data)}
                            </span>
                            <span className="text-[0.7rem] text-texto-suave">{diaDaSemana(p.data)}</span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-tinta">{p.tema}</span>
                            <span className="block truncate text-xs text-texto-suave">
                              {[p.horario, p.habilidades.join(", "), p.registro ? "com registro" : ""]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <SituacaoPlano plano={p} hoje={hoje} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ),
            sobre: (
              <>
                <h2 className="text-lg">Sobre a turma</h2>
                <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Série", turma.serie],
                    ["Turno", turma.periodo],
                    ["Responsável", professor.nome],
                    ["Alunos", String(alunos.length)],
                    ["Período dos dados", `${dataPorExtenso(periodo.inicio)} a ${dataPorExtenso(periodo.fim)}`],
                    ["Atividades aplicadas", String(resumo.atividadesAplicadas)],
                    ["Acerto médio", pct(resumo.acertoMedio)],
                    ["Conclusão média", pct(resumo.conclusaoMedia)],
                    ["Tentativas por atividade", decimal(resumo.tentativasMedia)],
                  ].map(([r, v]) => (
                    <div key={r} className="rounded-xl bg-[#F3F1FA] px-4 py-3">
                      <dt className="text-xs text-texto-suave">{r}</dt>
                      <dd className="mt-0.5 font-semibold text-tinta first-letter:uppercase">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ),
          }}
        />

        <Link
          href="/professor/alunos"
          className="-mt-2 inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
        >
          Todos os alunos <IconeSeta tamanho={14} />
        </Link>
      </div>
    </div>
  );
}
