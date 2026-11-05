import type { Metadata } from "next";
import Link from "next/link";
import { FiltroTurmas } from "@/components/painel/filtros";
import { notFound } from "next/navigation";
import { Avatar, ChipResultado, pct } from "@/components/painel/blocos";
import { CORES_PENTAGRAMA, Pentagrama } from "@/components/painel/pentagrama";
import { habilidadesDaTurma, listaDeTurmas, professorLogado, avataresDosAlunos } from "@/lib/painel/dados";
import { COR_JEITO, GUIA_JEITOS, MINIMO_JEITO, insightsDaTurma, provaSugerida } from "@/lib/painel/insights";
import { PONTAS } from "@/lib/painel/pentagrama";

export const metadata: Metadata = { title: "Habilidades e insights · Painel do professor · Modolume" };

/** Formato do editor de atividades que combina com cada jeito (para "montar atividade"). */
const FORMATO_ATIVIDADE: Record<(typeof PONTAS)[number], string> = {
  Visual: "associacao-visual",
  "Mãos na massa": "pronta",
  Lógico: "sequencia",
  Simbólico: "objetiva",
  Espacial: "pronta",
};

export default async function Habilidades({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const professor = await professorLogado();
  const avatares = await avataresDosAlunos();
  const turmas = await listaDeTurmas(professor);
  const { turma: pedida } = await searchParams;
  const turmaId = pedida ?? turmas[0]?.turma.id;
  if (!turmaId) return <p className="text-texto">Nenhuma turma cadastrada para você ainda.</p>;
  const dados = await habilidadesDaTurma(professor, turmaId);
  if (!dados) notFound();

  const { turma, pontas, alunos } = dados;
  const dicas = insightsDaTurma(
    pontas,
    alunos.map((a) => ({ nome: a.nome, forte: a.forte })),
  );
  const prova = provaSugerida(pontas, alunos);
  const totalProva = prova.reduce((s, p) => s + p.questoes, 0);
  const semDados = alunos.filter((a) => !a.forte);
  const acertoNoJeito = (aluno: (typeof alunos)[number], jeito: string) =>
    aluno.pontas.find((p) => p.jeito === jeito)?.aluno;
  const ordemTurma = [...pontas].filter((p) => p.aluno !== null).sort((a, b) => b.aluno! - a.aluno!);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-tight">Habilidades e insights</h1>
          <p className="mt-1 max-w-3xl text-sm text-texto-suave">
            Em que jeito de aprender a turma e cada aluno vão melhor, com sugestões para ensinar e avaliar.
          </p>
        </div>
        <FiltroTurmas
          turmas={turmas.map(({ turma: t }) => t)}
          atual={turma.id}
          todas={false}
          href={(id) => `/professor/habilidades?turma=${id}`}
        />
      </header>

      {/* destaque: o pentagrama da turma e a leitura de cada ponta */}
      <section className="sombra-suave grid items-center gap-6 rounded-2xl bg-superficie p-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <div>
          <h2 className="text-xl">Como o {turma.nome} aprende</h2>
          <p className="mt-1 text-sm text-texto-suave">Acerto da turma em cada jeito de aprender.</p>
          <div className="mt-2 flex justify-center">
            <Pentagrama
              valores={pontas}
              nomeAluno={turma.nome}
              nomes={{ principal: turma.nome, comparacao: "todas as turmas" }}
            />
          </div>
          <ul className="flex flex-wrap justify-center gap-4 text-xs text-texto">
            <li className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 rounded" style={{ background: CORES_PENTAGRAMA.aluno }} aria-hidden />
              {turma.nome}
            </li>
            <li className="flex items-center gap-1.5">
              <span
                className="w-5 border-t-2 border-dashed"
                style={{ borderColor: CORES_PENTAGRAMA.turma }}
                aria-hidden
              />
              Todas as suas turmas
            </li>
          </ul>
        </div>

        <ol className="flex flex-col">
          {ordemTurma.map((p, i) => {
            const n = alunos.filter((a) => a.forte === p.jeito).length;
            return (
              <li
                key={p.jeito}
                className="grid grid-cols-[28px_1fr_auto] items-center gap-x-3 border-t border-[#EEEBF6] py-3.5 first:border-t-0"
              >
                <span className="tnum text-sm font-semibold text-texto-fraco">{i + 1}º</span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-tinta">
                    <span className="size-2.5 rounded-full" style={{ background: COR_JEITO[p.jeito] }} aria-hidden />
                    {p.jeito}
                  </p>
                  <p className="mt-0.5 text-xs text-texto-suave">
                    {p.formatos.join(", ")} ·{" "}
                    {n === 0 ? "ninguém tem como ponto forte" : `ponto forte de ${n} ${n === 1 ? "aluno" : "alunos"}`}
                  </p>
                </div>
                <p className="text-right">
                  <span className="tnum block font-display text-2xl font-semibold text-tinta">{pct(p.aluno!)}</span>
                  {p.turma !== null ? (
                    <span className="text-xs text-texto-suave">
                      {p.aluno! === p.turma
                        ? "igual às outras"
                        : `${p.aluno! > p.turma ? "+" : "−"}${Math.abs(p.aluno! - p.turma)} das outras`}
                    </span>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        {/* próxima prova, numa barra só */}
        <section className="sombra-suave rounded-2xl bg-superficie p-5">
          <h2 className="text-lg">Sugestão para a próxima prova</h2>
          <p className="mt-0.5 text-sm text-texto-suave">
            {totalProva} questões divididas pelo jeito em que cada aluno vai melhor.
          </p>
          <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {prova.map((p) => (
              <span
                key={p.jeito}
                style={{ width: `${(p.questoes / totalProva) * 100}%`, background: COR_JEITO[p.jeito] }}
              />
            ))}
          </div>
          <ul className="mt-4 flex flex-col gap-2.5">
            {prova.map((p) => (
              <li key={p.jeito} className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 text-sm">
                <span className="tnum font-display text-lg font-semibold text-tinta">{p.questoes}</span>
                <span className="text-tinta">
                  {p.questoes === 1 ? "questão" : "questões"} {p.tipo}
                  <span className="block text-xs text-texto-suave">
                    <span
                      className="mr-1 inline-block size-2 rounded-full"
                      style={{ background: COR_JEITO[p.jeito] }}
                      aria-hidden
                    />
                    {p.jeito} ·{" "}
                    {p.alunos === 0
                      ? "uma questão para praticar"
                      : `${p.alunos} ${p.alunos === 1 ? "aluno" : "alunos"}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="sombra-suave rounded-2xl bg-superficie p-5">
          <h2 className="text-lg">O que vale saber</h2>
          <ul className="mt-2 flex flex-col">
            {dicas.map((d) => (
              <li key={d.titulo} className="border-t border-[#EEEBF6] py-3 text-sm first:border-t-0">
                <p className="font-semibold text-tinta">{d.titulo}</p>
                <p className="mt-0.5 text-texto">{d.texto}</p>
                {d.base ? <p className="mt-1 text-xs text-texto-suave">Base: {d.base}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* quadro: cada jeito numa linha, com os alunos que vão melhor nele */}
      <section className="sombra-suave rounded-2xl bg-superficie">
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-lg">Quadro da turma</h2>
          <p className="mt-0.5 text-sm text-texto-suave">
            Os alunos agrupados pelo jeito em que vão melhor. Use para formar grupos e adaptar atividades.
          </p>
        </div>
        <ul>
          {PONTAS.map((jeito) => {
            const doJeito = alunos.filter((a) => a.forte === jeito);
            return (
              <li
                key={jeito}
                className="grid gap-3 border-t border-[#EEEBF6] px-5 py-4 md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-1 rounded-full" style={{ background: COR_JEITO[jeito] }} aria-hidden />
                  <div>
                    <p className="font-semibold text-tinta">{jeito}</p>
                    <p className="text-xs text-texto-suave">
                      {doJeito.length} {doJeito.length === 1 ? "aluno" : "alunos"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {doJeito.length === 0 ? (
                    <span className="text-sm text-texto-suave">Ninguém tem este como ponto forte.</span>
                  ) : (
                    doJeito.map((a) => (
                      <Link
                        key={a.alunoId}
                        href={`/professor/alunos/${a.alunoId}`}
                        title={`${a.nome}: ${acertoNoJeito(a, jeito)}% em ${jeito.toLowerCase()}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#E2DEF0] pr-3 pl-1.5 text-sm text-tinta"
                      >
                        <Avatar nome={a.nome} tamanho={24} svg={avatares[a.alunoId]} />
                        {a.nome.split(" ")[0]}
                        <span className="tnum text-xs text-texto-suave">{acertoNoJeito(a, jeito)}%</span>
                      </Link>
                    ))
                  )}
                </div>
                <div className="flex gap-2 text-sm font-semibold md:justify-end">
                  <Link
                    href={`/professor/atividades/nova?turma=${turma.id}&formato=${FORMATO_ATIVIDADE[jeito]}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-[#D9D4EC] px-3.5 text-tinta"
                  >
                    Montar atividade
                  </Link>
                  {doJeito.length > 0 ? (
                    <Link
                      href={`/professor/planejamento/novo?turma=${turma.id}&alunos=${doJeito.map((a) => a.alunoId).join(",")}&formatos=${GUIA_JEITOS[jeito].formatos.join(",")}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-[#D9D4EC] px-3.5 text-tinta"
                    >
                      Planejar aula
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
          {semDados.length > 0 ? (
            <li className="border-t border-[#EEEBF6] px-5 py-4 text-sm text-texto">
              <strong className="text-tinta">Ainda sem ponto forte</strong> (menos de {MINIMO_JEITO} atividades por
              jeito): {semDados.map((a) => a.nome.split(" ")[0]).join(", ")}
            </li>
          ) : null}
        </ul>
      </section>

      {/* mapa completo, para conferir aluno a aluno */}
      <details className="sombra-suave rounded-2xl bg-superficie p-5">
        <summary className="flex min-h-11 cursor-pointer items-center text-base font-semibold text-tinta">
          Mapa completo: cada aluno em cada jeito
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs text-texto-suave">
              <tr>
                <th className="py-2 pr-3 font-medium">Aluno</th>
                {PONTAS.map((p) => (
                  <th key={p} className="px-2 py-2 text-center font-medium">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alunos.map((a, i) => (
                <tr key={a.alunoId} className={i % 2 ? "bg-[#F6F4FC]" : ""}>
                  <td className="rounded-l-xl py-1.5 pr-3 pl-2 font-semibold whitespace-nowrap text-tinta">{a.nome}</td>
                  {a.pontas.map((p) => (
                    <td key={p.jeito} className="px-2 py-1.5 text-center last:rounded-r-xl">
                      {p.aluno === null ? (
                        <span className="text-texto-fraco">—</span>
                      ) : (
                        <span className={`inline-flex ${p.atividades < MINIMO_JEITO ? "opacity-45" : ""}`}>
                          <ChipResultado
                            valor={p.aluno}
                            titulo={`${a.nome} · ${p.jeito}: ${p.aluno}% em ${p.atividades} atividades`}
                          />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
