import Link from "next/link";
import { Cabecalho } from "@/components/painel/blocos";
import { BarraValor } from "@/components/escola/estrutura";
import { apiDaEquipe } from "@/lib/escola/api";
import type { VisaoCoordenacao } from "@/lib/escola/tipos";

/** Todas as turmas com os parâmetros gerais lado a lado. */
export default async function TurmasCoordenacao() {
  const v = await apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao");
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho titulo="Turmas" descricao={`Parâmetros de cada turma nos últimos ${v.janelaDias} dias.`} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {v.turmas.map((t) => (
          <Link
            key={t.id}
            href={`/coordenacao/turmas/${t.id}`}
            className="sombra-suave flex flex-col gap-4 rounded-2xl bg-superficie p-5 transition-transform hover:-translate-y-0.5"
          >
            <div>
              <p className="font-display text-lg font-semibold text-tinta">{t.nome}</p>
              <p className="text-sm text-texto-suave">
                {t.serie} · {t.periodo}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-texto-suave">Acerto médio</p>
              <BarraValor valor={t.acertoMedio} />
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Alunos", t.alunos],
                ["Jogaram (7 dias)", `${t.participacao}%`],
                ["Atenção", t.alunosAtencao],
              ].map(([r, n]) => (
                <div key={r} className="rounded-xl bg-suave/70 px-2 py-2">
                  <dd className="tnum font-display text-lg font-semibold text-tinta">{n}</dd>
                  <dt className="text-[0.7rem] text-texto-suave">{r}</dt>
                </div>
              ))}
            </dl>
            <p className="text-sm text-texto-suave">
              {t.professores.length ? (
                t.professores.map((p) => p.nome).join(", ")
              ) : (
                <span className="text-alerta">Sem professor vinculado</span>
              )}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
