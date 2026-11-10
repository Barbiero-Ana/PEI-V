import Link from "next/link";
import { NOME_SEGMENTO } from "@modolume/core";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { BarraValor, Indicador } from "@/components/escola/estrutura";
import { apiDaEquipe } from "@/lib/escola/api";
import type { VisaoCoordenacao } from "@/lib/escola/tipos";

/** Visão da escola: parâmetros gerais e o que pede atenção primeiro. */
export default async function VisaoEscola({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const [v, { senha }] = await Promise.all([apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao"), searchParams]);
  const e = v.escola;
  const pedemAtencao = [...v.turmas]
    .filter((t) => t.alunosAtencao > 0 || t.professores.length === 0 || t.semJogar > 0)
    .sort((a, b) => b.alunosAtencao - a.alunosAtencao);

  return (
    <div className="flex flex-col gap-6">
      {senha === "trocada" ? (
        <p role="status" className="rounded-xl bg-roxo-claro px-4 py-3 text-sm text-tinta">
          Senha trocada com sucesso.
        </p>
      ) : null}
      <Cabecalho
        titulo="Visão do segmento"
        descricao={`${v.instituicao.nome} · ${v.segmento ? NOME_SEGMENTO[v.segmento] : "Segmento a definir"} · últimos ${v.janelaDias} dias`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Indicador
          rotulo="Acerto médio do segmento"
          valor={e.acertoMedio === null ? "—" : `${e.acertoMedio}%`}
          destaque
        />
        <Indicador
          rotulo="Participação (7 dias)"
          valor={e.participacao === null ? "—" : `${e.participacao}%`}
          detalhe="alunos que jogaram na semana"
        />
        <Indicador rotulo="Alunos" valor={e.alunos} detalhe={`${e.turmas} turmas ativas`} />
        <Indicador
          rotulo="Pedem atenção"
          valor={e.alunosAtencao}
          detalhe="acerto abaixo de 60%, com 3 jogadas ou mais"
        />
        <Indicador rotulo="Turmas sem professor" valor={e.turmasSemProfessor} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Painel
          titulo="Turmas"
          descricao="Parâmetros gerais de cada turma"
          acao={{ href: "/coordenacao/turmas", rotulo: "Ver turmas" }}
          semRecuo
        >
          <ul className="divide-y divide-[#E6E2F3]">
            {v.turmas.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/coordenacao/turmas/${t.id}`}
                  className="grid gap-2 px-5 py-3 transition-colors hover:bg-suave/60 sm:grid-cols-[1fr_180px_110px] sm:items-center"
                >
                  <span>
                    <span className="block font-semibold text-tinta">{t.nome}</span>
                    <span className="block text-xs text-texto-suave">
                      {t.alunos} alunos · {t.professores.map((p) => p.nome).join(", ") || "sem professor"}
                    </span>
                  </span>
                  <BarraValor valor={t.acertoMedio} />
                  <span className="text-sm text-texto-suave sm:text-right">{t.participacao}% jogaram</span>
                </Link>
              </li>
            ))}
          </ul>
        </Painel>

        <Painel titulo="Pede atenção agora">
          {pedemAtencao.length === 0 ? (
            <p className="text-sm text-texto-suave">Nenhuma turma pedindo atenção neste momento.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pedemAtencao.map((t) => (
                <li key={t.id} className="rounded-xl bg-suave/70 px-4 py-3">
                  <Link
                    href={`/coordenacao/turmas/${t.id}`}
                    className="font-semibold text-tinta hover:text-roxo-escuro"
                  >
                    {t.nome}
                  </Link>
                  <ul className="mt-1 text-sm text-texto-suave">
                    {t.professores.length === 0 ? (
                      <li>
                        Sem professor vinculado ·{" "}
                        <Link href="/coordenacao/vinculos" className="font-semibold text-roxo-escuro">
                          vincular
                        </Link>
                      </li>
                    ) : null}
                    {t.alunosAtencao > 0 ? <li>{t.alunosAtencao} alunos com acerto abaixo de 60%</li> : null}
                    {t.semJogar > 0 ? <li>{t.semJogar} alunos sem jogar há 14 dias</li> : null}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Painel>
      </div>

      <Painel titulo="Acerto por formato no segmento" acao={{ href: "/coordenacao/desempenho", rotulo: "Por turma" }}>
        {e.porFormato.length === 0 ? (
          <p className="text-sm text-texto-suave">Ainda sem jogadas no período.</p>
        ) : (
          <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">
            {e.porFormato.map((f) => (
              <li key={f.formato} className="grid grid-cols-[150px_1fr] items-center gap-3">
                <span className="text-sm text-tinta">
                  {f.rotulo}
                  <span className="block text-xs text-texto-suave">{f.amostra} jogadas</span>
                </span>
                <BarraValor valor={f.acertoMedio} />
              </li>
            ))}
          </ul>
        )}
      </Painel>
    </div>
  );
}
