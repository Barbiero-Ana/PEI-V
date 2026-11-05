import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, LIMITE_ATENCAO, dataCompleta, dataCurta, isoLocal } from "@/components/painel/blocos";
import { IconeVoltar } from "@/components/painel/icones";
import { CelularPrevia, PreviaQuestao } from "@/components/painel/previa-atividade";
import { SOBRE_FORMATOS, buscarAtividade, missaoDa, situacaoDaAtividade, type Questao } from "@/lib/painel/atividades";
import { listaDeTurmas, professorLogado } from "@/lib/painel/dados";
import { HABILIDADES_BNCC, buscarPlano } from "@/lib/painel/planejamento";
import { apagarAtividade, enviarAtividade, voltarParaRascunho } from "../acoes";

export const metadata: Metadata = { title: "Atividade · Painel do professor · Modolume" };

/** Gabarito de cada questão, para o professor conferir. */
function Gabarito({ q }: { q: Questao }) {
  switch (q.tipo) {
    case "objetiva":
      return (
        <>
          <p className="font-semibold text-tinta">{q.enunciado}</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {q.alternativas.map((a, i) => (
              <li key={i} className={i === q.correta ? "font-semibold text-[#24704A]" : "text-texto"}>
                {String.fromCharCode(97 + i)}) {a}
                {i === q.correta ? " · correta" : ""}
              </li>
            ))}
          </ul>
        </>
      );
    case "completar":
      return (
        <p className="text-tinta">
          {q.texto.split(/(\[[^\]]*\])/g).map((p, i) =>
            p.startsWith("[") ? (
              <strong key={i} className="rounded bg-[#EEF8F2] px-1 text-[#24704A]">
                {p.slice(1, -1)}
              </strong>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
        </p>
      );
    case "associacao-visual":
      return (
        <ul className="flex flex-wrap gap-2">
          {q.pares.map((p, i) => (
            <li key={i} className="rounded-lg bg-[#F3F1FA] px-2.5 py-1 text-tinta">
              {p.a} ↔ {p.b}
            </li>
          ))}
        </ul>
      );
    case "sequencia":
      return <p className="text-tinta">{q.itens.join("  →  ")}</p>;
  }
}

export default async function Atividade({ params }: { params: Promise<{ id: string }> }) {
  const professor = await professorLogado();
  const { id } = await params;
  const [atividade, turmas] = await Promise.all([buscarAtividade(professor, id), listaDeTurmas(professor)]);
  if (!atividade) notFound();
  const [plano, situacao] = await Promise.all([
    atividade.planoId ? buscarPlano(professor, atividade.planoId) : null,
    atividade.status === "enviada" ? situacaoDaAtividade(atividade.id) : null,
  ]);
  const fizeram = situacao?.alunos.filter((a) => a.concluiu) ?? [];
  const faltam = situacao?.alunos.filter((a) => !a.concluiu) ?? [];
  const missao = missaoDa(atividade);
  const enviada = atividade.status === "enviada";
  const hoje = isoLocal(new Date());
  const botao = "h-11 w-full rounded-full text-sm font-semibold";

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/professor/atividades"
        className="inline-flex items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> Atividades
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <header>
            <p className="text-sm text-texto-suave">
              {atividade.formato === "pronta" ? "Atividade pronta do app" : SOBRE_FORMATOS[atividade.formato].nome}
              {atividade.habilidade ? ` · ${atividade.habilidade}` : ""}
            </p>
            <h1 className="mt-1 text-[1.75rem] leading-tight">{atividade.titulo}</h1>
            {atividade.instrucao ? <p className="mt-1 text-texto">{atividade.instrucao}</p> : null}
          </header>

          {/* situação do envio e o que acontece depois */}
          <section className={`rounded-2xl px-5 py-4 ${enviada ? "bg-[#EEF8F2]" : "bg-[#F3F1FA]"}`}>
            <p className={`font-semibold ${enviada ? "text-[#24704A]" : "text-tinta"}`}>
              {enviada
                ? atividade.liberarEm <= hoje
                  ? `No app desde ${dataCompleta(atividade.liberarEm)}`
                  : `Enviada · aparece no app em ${dataCompleta(atividade.liberarEm)}`
                : "Rascunho · os alunos ainda não veem esta atividade"}
            </p>
            <p className="mt-1 text-sm text-texto">
              {enviada
                ? "Quando os alunos fizerem a atividade no app, os resultados aparecem aqui e entram no desempenho, no pentagrama e nos insights de cada um."
                : "Revise as questões e envie quando estiver pronta."}
            </p>
          </section>

          {enviada ? (
            <section className="sombra-suave rounded-2xl bg-superficie p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg">Quem já fez</h2>
                {situacao ? (
                  <p className="text-sm text-texto">
                    <strong className="text-tinta">{fizeram.length}</strong> de {situacao.alunos.length} alunos
                  </p>
                ) : null}
              </div>
              {!situacao ? (
                <p className="mt-1 text-sm text-texto">
                  Com os dados de demonstração, o painel não está ligado ao app. Com a API ligada, aqui aparece quem fez
                  a atividade e o acerto de cada um.
                </p>
              ) : (
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-tinta">Fizeram ({fizeram.length})</h3>
                    {fizeram.length === 0 ? (
                      <p className="mt-1 text-sm text-texto-suave">Ninguém ainda.</p>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-1">
                        {fizeram.map((a) => (
                          <li key={a.id}>
                            <Link
                              href={`/professor/alunos/${a.id}`}
                              className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-sm text-tinta"
                            >
                              <Avatar nome={a.nome} tamanho={28} svg={a.avatarSvg} />
                              <span className="min-w-0 flex-1 truncate">{a.nome}</span>
                              <span
                                className={`tnum font-semibold ${a.acerto !== null && a.acerto < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}
                              >
                                {a.acerto}%
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-tinta">Ainda não fizeram ({faltam.length})</h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {faltam.map((a) => (
                        <li key={a.id} className="rounded-full bg-[#F3F1FA] px-3 py-1 text-sm text-texto">
                          {a.nome.split(" ")[0]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          ) : null}

          <section className="sombra-suave rounded-2xl bg-superficie p-5">
            <h2 className="text-lg">
              {atividade.formato === "pronta"
                ? "Atividade do app"
                : `Gabarito · ${atividade.questoes.length} ${atividade.questoes.length === 1 ? "questão" : "questões"}`}
            </h2>
            {atividade.formato === "pronta" ? (
              <p className="mt-2 text-sm text-texto">
                <strong className="text-tinta">{missao?.titulo}</strong> · {missao?.conteudo}. A correção é feita pelo
                próprio jogo no app.
              </p>
            ) : (
              <ol className="mt-3 flex flex-col">
                {atividade.questoes.map((q, i) => (
                  <li
                    key={i}
                    className="grid gap-1 border-t border-[#EEEBF6] py-3 text-sm first:border-t-0 sm:grid-cols-[90px_1fr]"
                  >
                    <span className="text-xs font-semibold text-texto-suave">Questão {i + 1}</span>
                    <div>
                      <Gabarito q={q} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-0">
          <section className="sombra-suave rounded-2xl bg-superficie p-5">
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs text-texto-suave">Turmas</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {atividade.turmas.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-roxo-claro px-2 py-0.5 text-xs font-semibold text-roxo-escuro"
                    >
                      {turmas.find((x) => x.turma.id === t)?.turma.nome}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-texto-suave">Liberar a partir de</dt>
                <dd className="font-semibold text-tinta">{dataCompleta(atividade.liberarEm)}</dd>
              </div>
              {atividade.habilidade ? (
                <div>
                  <dt className="text-xs text-texto-suave">Habilidade</dt>
                  <dd className="text-tinta">
                    <strong>{atividade.habilidade}</strong>{" "}
                    {HABILIDADES_BNCC.find((h) => h.codigo === atividade.habilidade)?.resumo}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-texto-suave">Plano de aula</dt>
                <dd>
                  {plano ? (
                    <Link href={`/professor/planejamento/${plano.id}`} className="font-semibold text-roxo-escuro">
                      {dataCurta(plano.data)} · {plano.tema}
                    </Link>
                  ) : (
                    <span className="text-texto-suave">Sem plano</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              {enviada ? (
                <form action={voltarParaRascunho.bind(null, atividade.id)}>
                  <button type="submit" className={`${botao} border border-[#D9D4EC] text-tinta`}>
                    Tirar do app (voltar a rascunho)
                  </button>
                </form>
              ) : (
                <form action={enviarAtividade.bind(null, atividade.id)}>
                  <button type="submit" className={`${botao} bg-roxo-escuro text-white`}>
                    Enviar para o app
                  </button>
                </form>
              )}
              <Link
                href={`/professor/atividades/${atividade.id}/editar`}
                className={`${botao} inline-flex items-center justify-center border border-[#D9D4EC] text-tinta`}
              >
                Editar
              </Link>
              <details className="mt-1 text-sm">
                <summary className="flex min-h-11 cursor-pointer items-center justify-center font-semibold text-texto-suave">
                  Excluir
                </summary>
                <form action={apagarAtividade.bind(null, atividade.id)} className="mt-2">
                  <button type="submit" className={`${botao} border border-alerta text-alerta`}>
                    Excluir definitivamente
                  </button>
                </form>
              </details>
            </div>
          </section>

          <p className="text-center text-sm font-semibold text-tinta">Como o aluno vê no app</p>
          <CelularPrevia
            titulo={atividade.titulo}
            instrucao={atividade.instrucao}
            numero={atividade.formato === "pronta" ? 0 : 1}
            total={atividade.formato === "pronta" ? 0 : atividade.questoes.length}
          >
            <PreviaQuestao
              questao={atividade.questoes[0]}
              pronta={
                missao ? { titulo: missao.titulo, conteudo: missao.conteudo, instrucao: atividade.instrucao } : null
              }
            />
          </CelularPrevia>
        </aside>
      </div>
    </div>
  );
}
