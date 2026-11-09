import type { Metadata } from "next";
import Link from "next/link";
import type { IndicadorSmart, SituacaoMeta } from "@modolume/core";
import { Cabecalho, FAIXAS, LIMITE_ATENCAO, corDaTurma, dataCurta, decimal, pct } from "@/components/painel/blocos";
import { FiltroTurmas, comFiltros } from "@/components/painel/filtros";
import { IndicadoresSmart } from "@/components/painel/indicadores-smart";
import { desempenhoDasTurmas, desempenhoGeral, professorLogado } from "@/lib/painel/dados";

export const metadata: Metadata = { title: "Desempenho · Painel do professor · Modolume" };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Gráfico de linhas: acerto médio por mês, uma linha por turma, com rótulo no fim de cada uma. */
function GraficoEvolucao({
  series,
}: {
  series: { nome: string; cor: string; pontos: { data: string; acerto: number; amostra: number }[] }[];
}) {
  const meses = [...new Set(series.flatMap((s) => s.pontos.map((p) => p.data)))].sort();
  const valores = series.flatMap((s) => s.pontos.map((p) => p.acerto));
  const min = Math.max(0, Math.floor((Math.min(...valores, LIMITE_ATENCAO) - 5) / 10) * 10);
  const max = Math.min(100, Math.ceil((Math.max(...valores) + 5) / 10) * 10);
  // largura parecida com a da tela, para o texto do gráfico ficar no tamanho do resto da página
  const L = 1100;
  const A = 300;
  const m = { e: 48, d: 130, t: 16, b: 34 };
  const x = (i: number) => m.e + (meses.length > 1 ? (i * (L - m.e - m.d)) / (meses.length - 1) : (L - m.e - m.d) / 2);
  const y = (v: number) => m.t + ((max - v) * (A - m.t - m.b)) / (max - min);
  // rótulos no fim das linhas: afasta os que ficariam um em cima do outro
  const rotulos = series
    .map((s) => ({ nome: s.nome, ultimo: s.pontos.at(-1) }))
    .filter((r) => r.ultimo)
    .map((r) => ({ ...r, y: y(r.ultimo!.acerto) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < rotulos.length; i++)
    if (rotulos[i]!.y - rotulos[i - 1]!.y < 16) rotulos[i]!.y = rotulos[i - 1]!.y + 16;
  const yRotulo = (nome: string) => rotulos.find((r) => r.nome === nome)?.y ?? 0;
  const grade = Array.from({ length: (max - min) / 10 + 1 }, (_, i) => min + i * 10);

  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="h-auto w-full" role="img" aria-label="Acerto médio por mês em cada turma">
      {grade.map((g) => (
        <g key={g}>
          <line x1={m.e} x2={L - m.d} y1={y(g)} y2={y(g)} stroke="#ECE9F5" strokeWidth={1} />
          <text x={m.e - 8} y={y(g) + 4} textAnchor="end" className="fill-texto-suave text-[12px]">
            {g}%
          </text>
        </g>
      ))}
      {/* limite de atenção */}
      <line
        x1={m.e}
        x2={L - m.d}
        y1={y(LIMITE_ATENCAO)}
        y2={y(LIMITE_ATENCAO)}
        stroke="#B4531A"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <text x={L - m.d + 6} y={y(LIMITE_ATENCAO) + 4} className="fill-alerta text-[10px]">
        limite 60%
      </text>
      {meses.map((mes, i) => (
        <text key={mes} x={x(i)} y={A - 10} textAnchor="middle" className="fill-texto-suave text-[12px]">
          {MESES[Number(mes.slice(5)) - 1]}
        </text>
      ))}
      {series.map((s) => {
        const pts = s.pontos.map((p) => ({ ...p, i: meses.indexOf(p.data) }));
        const ultimo = pts.at(-1);
        return (
          <g key={s.nome}>
            <polyline
              points={pts.map((p) => `${x(p.i)},${y(p.acerto)}`).join(" ")}
              fill="none"
              stroke={s.cor}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {pts.map((p) => (
              <g key={p.data}>
                <circle cx={x(p.i)} cy={y(p.acerto)} r={12} fill="transparent">
                  <title>{`${s.nome} · ${MESES[Number(p.data.slice(5)) - 1]}: ${p.acerto}% de acerto (${p.amostra} resultados)`}</title>
                </circle>
                <circle
                  cx={x(p.i)}
                  cy={y(p.acerto)}
                  r={4.5}
                  fill={s.cor}
                  stroke="#fff"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            ))}
            {ultimo ? (
              <text x={x(ultimo.i) + 12} y={yRotulo(s.nome) + 4} className="fill-tinta text-[13px] font-semibold">
                {s.nome} {ultimo.acerto}%
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

const SITUACAO: Record<SituacaoMeta, { rotulo: string; classe: string }> = {
  atingida: { rotulo: "Atingida", classe: "text-roxo-escuro" },
  perto: { rotulo: "Perto da meta", classe: "text-[#1F6E9F]" },
  abaixo: { rotulo: "Abaixo da meta", classe: "font-semibold text-alerta" },
  "sem-dados": { rotulo: "Sem dados", classe: "text-texto-suave" },
};
const valorMeta = (i: IndicadorSmart, v: number | null) =>
  v === null ? "—" : i.meta.unidade === "%" ? pct(v) : decimal(v);

/** Até quantas turmas o gráfico e os formatos mostram uma linha por turma; acima disso, a média geral. */
const COMPARAR_ATE = 4;

export default async function Desempenho({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const professor = await professorLogado();
  const [todasAsTurmas, geral] = await Promise.all([desempenhoDasTurmas(professor), desempenhoGeral(professor)]);
  const { turma: pedida = "" } = await searchParams;
  const escolhida = todasAsTurmas.find((t) => t.turma.id === pedida);
  // a cor de cada turma é a mesma do resto do painel, mesmo com filtro
  const corDe = (id: string) =>
    id === "geral" ? "#1E2A78" : corDaTurma(todasAsTurmas.findIndex((t) => t.turma.id === id)).hex;
  // com muitas turmas, uma linha por turma vira um emaranhado: mostra a média geral
  const agrupado = !escolhida && todasAsTurmas.length > COMPARAR_ATE;
  const turmas: {
    turma: { id: string; nome: string };
    evolucao: typeof geral.evolucao;
    formatos: typeof geral.formatos;
  }[] = escolhida
    ? [escolhida]
    : agrupado
      ? [{ turma: { id: "geral", nome: "Todas as turmas" }, evolucao: geral.evolucao, formatos: geral.formatos }]
      : todasAsTurmas;
  const umaSerie = turmas.length === 1;
  const series = turmas.map((t) => ({
    nome: t.turma.nome,
    cor: corDe(t.turma.id),
    pontos: t.evolucao.map((p) => ({ data: p.data, acerto: p.acertoMedio, amostra: p.amostra })),
  }));
  const formatos = [...new Set(turmas.flatMap((t) => t.formatos.map((f) => f.formato)))].map((id) => ({
    id,
    rotulo: turmas.flatMap((t) => t.formatos).find((f) => f.formato === id)!.rotulo,
  }));
  // a frase do gráfico: quanto cada turma mudou do primeiro ao último mês
  const variacoes = turmas
    .filter((t) => t.evolucao.length > 1)
    .map((t) => ({
      nome: t.turma.nome,
      delta: Math.round(t.evolucao.at(-1)!.acertoMedio - t.evolucao[0]!.acertoMedio),
    }));

  const Legenda = () => (
    <ul className="flex flex-wrap gap-4 text-xs text-texto">
      {series.map((s) => (
        <li key={s.nome} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: s.cor }} aria-hidden />
          {s.nome}
        </li>
      ))}
    </ul>
  );

  const metasDe = todasAsTurmas[0]?.metas;

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Desempenho"
        descricao={
          agrupado
            ? `Metas SMART de cada turma e a média das ${todasAsTurmas.length} turmas. Escolha uma turma para ver só os dados dela.`
            : "Metas SMART, evolução do acerto e resultados por formato. Escolha uma turma para ver só os dados dela."
        }
      >
        <FiltroTurmas
          turmas={todasAsTurmas.map((t) => t.turma)}
          atual={escolhida?.turma.id ?? ""}
          href={(id) => comFiltros("/professor/desempenho", {}, { turma: id })}
        />
      </Cabecalho>

      {/* metas SMART: completas para uma turma; lado a lado quando são todas */}
      <section className="sombra-suave rounded-2xl bg-superficie p-5">
        {escolhida ? (
          <IndicadoresSmart painel={escolhida.metas} turmaId={escolhida.turma.id} />
        ) : metasDe ? (
          <>
            <h2 className="text-lg">Metas por turma</h2>
            <p className="mt-0.5 text-sm text-texto-suave">
              Últimas 4 semanas de cada turma, comparadas com as 4 anteriores. Escolha uma turma acima para ver como
              cada meta é medida e o que fazer.
            </p>
            <div className="mt-4 max-h-[560px] overflow-auto rounded-xl border border-[#EEEBF6]">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 z-10 bg-superficie">
                  <tr className="text-left text-xs text-texto-suave">
                    <th className="px-3 py-2 font-medium">Turma</th>
                    {metasDe.indicadores.map((ind) => (
                      <th key={ind.id} className="px-3 py-2 align-bottom font-medium">
                        <span className="block font-semibold text-tinta">{ind.nome}</span>
                        meta: {ind.meta.sentido === "minimo" ? "≥" : "≤"} {valorMeta(ind, ind.meta.valor)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todasAsTurmas.map((t) => (
                    <tr key={t.turma.id} className="border-t border-[#EEEBF6] align-top">
                      <th scope="row" className="px-3 py-2.5 text-left font-normal">
                        <Link
                          href={`/professor/desempenho?turma=${t.turma.id}`}
                          className="inline-flex min-h-11 flex-col justify-center"
                        >
                          <span className="flex items-center gap-1.5 font-semibold text-tinta">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ background: corDe(t.turma.id) }}
                              aria-hidden
                            />
                            {t.turma.nome}
                          </span>
                          <span className="text-xs whitespace-nowrap text-texto-suave">
                            {t.metas.atingidas} de {t.metas.indicadores.length} atingidas
                          </span>
                        </Link>
                      </th>
                      {t.metas.indicadores.map((i) => (
                        <td key={i.id} className="px-3 py-2.5">
                          <span className="tnum block font-display text-base leading-tight font-semibold text-tinta">
                            {valorMeta(i, i.valor)}
                          </span>
                          <span className={`text-xs ${SITUACAO[i.status].classe}`}>{SITUACAO[i.status].rotulo}</span>
                          {i.detalhe ? <span className="block text-xs text-texto-suave">{i.detalhe}</span> : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-texto-suave">
              Cada turma é medida nas suas 4 últimas semanas com atividade (por exemplo, {todasAsTurmas[0]!.turma.nome}:{" "}
              {dataCurta(todasAsTurmas[0]!.metas.janela.inicio)} a {dataCurta(todasAsTurmas[0]!.metas.janela.fim)}).
              Clique na turma para ver os detalhes.
            </p>
          </>
        ) : (
          <p className="text-sm text-texto">Nenhuma turma com atividades ainda.</p>
        )}
      </section>

      <section className="sombra-suave rounded-2xl bg-superficie p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg">Evolução do acerto médio{agrupado ? " · média das turmas" : ""}</h2>
            <p className="mt-0.5 text-sm text-texto">
              {variacoes.length
                ? variacoes
                    .map((v) => `${v.nome} ${v.delta >= 0 ? "subiu" : "caiu"} ${Math.abs(v.delta)} pontos`)
                    .join(" e ") + " do primeiro ao último mês."
                : "Ainda não há meses suficientes para comparar."}
            </p>
          </div>
          <Legenda />
        </div>
        <div className="mt-4">
          <GraficoEvolucao series={series} />
        </div>
        <details className="mt-2 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-roxo-escuro">
            Ver os números em tabela
          </summary>
          <table className="mt-3 w-full max-w-xl text-sm">
            <thead className="text-left text-xs text-texto-suave">
              <tr>
                <th className="py-1.5 font-medium">Mês</th>
                {turmas.map((t) => (
                  <th key={t.turma.id} className="py-1.5 text-right font-medium">
                    {t.turma.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...new Set(turmas.flatMap((t) => t.evolucao.map((p) => p.data)))].sort().map((mes) => (
                <tr key={mes} className="border-t border-[#EEEBF6]">
                  <td className="py-1.5 text-tinta">
                    {MESES[Number(mes.slice(5)) - 1]}/{mes.slice(0, 4)}
                  </td>
                  {turmas.map((t) => {
                    const p = t.evolucao.find((e) => e.data === mes);
                    return (
                      <td key={t.turma.id} className="tnum py-1.5 text-right text-tinta">
                        {p ? `${p.acertoMedio}% · ${p.amostra}` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-texto-suave">Acerto médio · quantidade de resultados no mês.</p>
        </details>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="sombra-suave rounded-2xl bg-superficie p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg">
                {umaSerie ? `Resultados por formato · ${turmas[0]!.turma.nome}` : "Acerto por formato em cada turma"}
              </h2>
              <p className="mt-0.5 text-sm text-texto-suave">
                {umaSerie
                  ? "Acerto, conclusão e tentativas médias em cada formato."
                  : "Uma barra por turma em cada formato."}
              </p>
            </div>
            <Legenda />
          </div>
          <ul className="mt-4 flex flex-col gap-4">
            {formatos.map((f) => (
              <li key={f.id}>
                <p className="mb-1.5 text-sm font-semibold text-tinta">{f.rotulo}</p>
                <div className="flex flex-col gap-1">
                  {turmas.map((t) => {
                    const d = t.formatos.find((x) => x.formato === f.id);
                    return (
                      <div
                        key={t.turma.id}
                        className="flex items-center gap-3"
                        title={`${t.turma.nome} · ${f.rotulo}: ${d ? `${d.acertoMedio}% (${d.amostra} resultados)` : "sem dados"}`}
                      >
                        <div className="h-2.5 flex-1 rounded-full bg-[#F0EEF7]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${d?.acertoMedio ?? 0}%`, background: corDe(t.turma.id) }}
                          />
                        </div>
                        <span
                          className={`tnum w-10 text-right text-xs font-semibold ${d && d.acertoMedio < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}
                        >
                          {d ? pct(d.acertoMedio) : "—"}
                        </span>
                        {umaSerie ? (
                          <span className="tnum hidden w-48 text-xs text-texto-suave sm:block">
                            {d ? `conclusão ${pct(d.conclusaoMedia)} · ${decimal(d.tentativasMedia)} tentativas` : ""}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="sombra-suave rounded-2xl bg-superficie p-5">
          <h2 className="text-lg">Alunos por faixa de acerto</h2>
          <p className="mt-0.5 text-sm text-texto-suave">Acerto médio de cada aluno no período.</p>
          <ul className="mt-3 flex flex-wrap gap-4 text-xs text-texto">
            {FAIXAS.map((f) => (
              <li key={f.min} className="flex items-center gap-1.5">
                <span className={`size-3 rounded-sm ${f.classe}`} aria-hidden />
                {f.rotulo}
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex max-h-[520px] flex-col gap-5 overflow-y-auto pr-1">
            {(escolhida ? [escolhida] : todasAsTurmas).map((t) => {
              const total = t.faixas.alto + t.faixas.medio + t.faixas.baixo || 1;
              const partes = [
                { n: t.faixas.alto, faixa: FAIXAS[0] },
                { n: t.faixas.medio, faixa: FAIXAS[1] },
                { n: t.faixas.baixo, faixa: FAIXAS[2] },
              ];
              return (
                <li key={t.turma.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-tinta">{t.turma.nome}</span>
                    <span className="text-texto-suave">média {pct(t.resumo.acertoMedio)}</span>
                  </div>
                  <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg">
                    {partes
                      .filter((p) => p.n > 0)
                      .map((p) => (
                        <div
                          key={p.faixa.min}
                          className={`grid place-items-center text-xs font-semibold ${p.faixa.classe}`}
                          style={{ width: `${(p.n / total) * 100}%` }}
                          title={`${p.n} alunos com ${p.faixa.rotulo}`}
                        >
                          {p.n}
                        </div>
                      ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
