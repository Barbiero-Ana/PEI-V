import Link from "next/link";
import { rotuloFormato } from "@modolume/core";
import { mudarStatus } from "@/app/professor/(painel)/planejamento/acoes";
import type { OpcoesPlanejamento } from "@/lib/painel/dados";
import { HABILIDADES_BNCC, atividadesDoApp, type PlanoAula } from "@/lib/painel/planejamento";
import { DuplicarPlano, RegistroRapido } from "./acoes-plano";
import { LIMITE_ATENCAO, dataPorExtenso, diaDaSemana, pct } from "./blocos";
import { FecharComEsc } from "./fechar-com-esc";
import { SituacaoPlano } from "./situacao-plano";

/**
 * Painel lateral com o plano de aula aberto a partir da agenda ou do
 * calendário, sem sair da página. O plano vem do endereço (?plano=), então o
 * link pode ser compartilhado e o botão Voltar do navegador fecha o painel.
 */
export function GavetaPlano({
  plano,
  turmas,
  fecharHref,
  hoje,
}: {
  plano: PlanoAula;
  turmas: OpcoesPlanejamento;
  fecharHref: string;
  hoje: string;
}) {
  const turma = turmas.find((t) => t.id === plano.turmaId);
  const alunos = turma?.alunos.filter((a) => plano.alunosFoco.includes(a.id)) ?? [];
  const botao = "h-11 rounded-full px-4 text-sm font-semibold";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gaveta-titulo"
    >
      <FecharComEsc href={fecharHref} />
      <Link href={fecharHref} scroll={false} aria-label="Fechar" className="absolute inset-0 bg-tinta/25" />

      <aside className="gaveta relative flex h-full w-full max-w-[460px] flex-col bg-superficie shadow-[-20px_0_50px_-30px_rgb(30_42_120/0.5)]">
        <header className="flex items-start justify-between gap-4 border-b border-[#E8E5F3] px-6 py-5">
          <div>
            <p className="text-sm text-texto-suave">
              {diaDaSemana(plano.data).charAt(0).toUpperCase() + diaDaSemana(plano.data).slice(1)},{" "}
              {dataPorExtenso(plano.data)}
              {plano.horario ? ` · ${plano.horario}` : ""} · {plano.aulas} {plano.aulas === 1 ? "aula" : "aulas"}
            </p>
            <h2 id="gaveta-titulo" className="mt-1 text-xl leading-snug">
              {plano.tema}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-roxo-claro px-2 py-0.5 text-xs font-semibold text-roxo-escuro">
                {turma?.nome}
              </span>
              <span className="text-xs text-texto-suave">{plano.unidade}</span>
              <SituacaoPlano plano={plano} hoje={hoje} />
            </div>
          </div>
          <Link
            href={fecharHref}
            scroll={false}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#D9D4EC] text-lg leading-none text-tinta"
            aria-label="Fechar"
          >
            ×
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="flex flex-col gap-5 text-sm">
            {plano.habilidades.length > 0 ? (
              <div>
                <dt className="text-xs font-semibold text-texto-suave">Habilidades da BNCC</dt>
                {plano.habilidades.map((c) => (
                  <dd key={c} className="mt-1 text-tinta">
                    <strong className="tnum">{c}</strong> {HABILIDADES_BNCC.find((h) => h.codigo === c)?.resumo}
                  </dd>
                ))}
              </div>
            ) : null}
            {(
              [
                ["Objetivos", plano.objetivos],
                ["Metodologia", plano.metodologia],
                ["Recursos", plano.recursos],
                ["Avaliação", plano.avaliacao],
              ] as const
            ).map(([r, v]) =>
              v ? (
                <div key={r}>
                  <dt className="text-xs font-semibold text-texto-suave">{r}</dt>
                  <dd className="mt-1 leading-relaxed whitespace-pre-line text-tinta">{v}</dd>
                </div>
              ) : null,
            )}

            {plano.formatos.length > 0 ? (
              <div>
                <dt className="text-xs font-semibold text-texto-suave">Formatos de atividade · acerto da turma</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {plano.formatos.map((f) => {
                    const dado = turma?.formatos[f];
                    return (
                      <span key={f} className="rounded-lg border border-[#D9D4EC] px-2.5 py-1 text-xs text-tinta">
                        {rotuloFormato(f)}
                        {dado ? (
                          <strong className={`ml-1.5 ${dado.acerto < LIMITE_ATENCAO ? "text-alerta" : ""}`}>
                            {pct(dado.acerto)}
                          </strong>
                        ) : null}
                      </span>
                    );
                  })}
                </dd>
              </div>
            ) : null}

            {plano.atividadesApp.length > 0 ? (
              <div>
                <dt className="text-xs font-semibold text-texto-suave">Atividades do app</dt>
                <dd className="mt-1 text-tinta">
                  {atividadesDoApp()
                    .filter((a) => plano.atividadesApp.includes(a.id))
                    .map((a) => `${a.titulo} (${a.conteudo.toLowerCase()})`)
                    .join(", ")}
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="text-xs font-semibold text-texto-suave">Alunos em acompanhamento</dt>
              {alunos.length === 0 ? (
                <dd className="mt-1 text-texto">Nenhum aluno marcado.</dd>
              ) : (
                alunos.map((a) => (
                  <dd
                    key={a.id}
                    className="mt-2 flex items-start justify-between gap-3 rounded-xl bg-[#F3F1FA] px-3 py-2"
                  >
                    <Link href={`/professor/alunos/${a.id}`} className="min-w-0">
                      <span className="block font-semibold text-tinta">{a.nome}</span>
                      {a.motivo ? <span className="block text-xs text-texto">{a.motivo}</span> : null}
                    </Link>
                    <span className={`tnum font-semibold ${a.acerto < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}>
                      {pct(a.acerto)}
                    </span>
                  </dd>
                ))
              )}
            </div>

            <div>
              <dt className="text-xs font-semibold text-texto-suave">Registro da aula</dt>
              <dd className="mt-2">
                {/* depois do dia da aula, o registro é escrito aqui mesmo */}
                {plano.data <= hoje ? (
                  <RegistroRapido plano={plano} />
                ) : (
                  <span className="text-texto-suave">Disponível a partir do dia da aula.</span>
                )}
              </dd>
            </div>

            <Link
              href={`/professor/atividades/nova?plano=${plano.id}`}
              className="flex items-center justify-between rounded-xl border border-dashed border-roxo px-4 py-3 text-sm font-semibold text-roxo-escuro"
            >
              Montar atividade para esta aula no app
              <span aria-hidden>›</span>
            </Link>

            <details className="rounded-xl border border-[#E2DEF0] px-4 py-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-tinta">
                Duplicar para outra turma ou data
              </summary>
              <div className="mt-3">
                <DuplicarPlano plano={plano} turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))} />
              </div>
            </details>
          </dl>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-[#E8E5F3] px-6 py-4">
          {plano.status === "realizada" ? (
            <form action={mudarStatus.bind(null, plano.id, "planejada")}>
              <button type="submit" className={`${botao} border border-[#D9D4EC] text-tinta`}>
                Voltar para planejada
              </button>
            </form>
          ) : null}
          <Link
            href={`/professor/planejamento/${plano.id}/editar`}
            className={`${botao} inline-flex items-center bg-tinta text-white`}
          >
            Editar plano
          </Link>
          <Link
            href={`/professor/planejamento/${plano.id}`}
            className="ml-auto inline-flex min-h-11 items-center text-sm font-semibold text-roxo-escuro"
          >
            Página completa
          </Link>
        </footer>
      </aside>
    </div>
  );
}
