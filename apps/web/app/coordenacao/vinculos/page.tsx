import Link from "next/link";
import { NOME_SEGMENTO } from "@modolume/core";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { Escolha } from "@/components/escola/formulario";
import { VinculosDaTurma } from "@/components/escola/vinculos";
import { apiDaEquipe } from "@/lib/escola/api";
import type { VisaoCoordenacao } from "@/lib/escola/tipos";

export default async function Vinculos({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; situacao?: string }>;
}) {
  const [v, f] = await Promise.all([apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao"), searchParams]);
  const turmas = v.turmas
    .filter((t) => f.situacao !== "sem-professor" || t.professores.length === 0)
    .sort(
      (a, b) => Number(a.professores.length > 0) - Number(b.professores.length > 0) || a.nome.localeCompare(b.nome),
    );
  const turma = turmas.find((t) => t.id === f.turma) ?? turmas[0];
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Professores e turmas"
        descricao={
          v.segmento
            ? `${NOME_SEGMENTO[v.segmento]} · Escolha uma turma e revise os professores com acesso.`
            : "A administração precisa definir seu segmento para liberar a gestão dos vínculos."
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Turmas do segmento", v.escola.turmas],
          ["Sem professor", v.escola.turmasSemProfessor],
          ["Professores vinculados", v.escola.professores],
        ].map(([rotulo, total]) => (
          <div key={rotulo} className="sombra-suave rounded-2xl bg-superficie p-4">
            <p className="text-sm text-texto-suave">{rotulo}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-tinta">{total}</p>
          </div>
        ))}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(230px,1fr)_minmax(0,2fr)]">
        <Painel titulo="Selecionar turma">
          <form method="get" className="flex flex-col gap-4">
            <Escolha
              nome="situacao"
              rotulo="Situação"
              valor={f.situacao}
              opcoes={[
                { valor: "", rotulo: "Todas as turmas" },
                { valor: "sem-professor", rotulo: "Sem professor" },
              ]}
            />
            <Escolha
              nome="turma"
              rotulo="Turma"
              valor={turma?.id}
              opcoes={
                turmas.length
                  ? turmas.map((t) => ({
                      valor: t.id,
                      rotulo: `${t.nome} · ${t.periodo}${t.professores.length ? "" : " · sem professor"}`,
                    }))
                  : [{ valor: "", rotulo: "Nenhuma turma disponível" }]
              }
            />
            <div className="flex items-center gap-3">
              <button className="min-h-11 rounded-xl bg-roxo px-4 font-semibold text-white">Aplicar</button>
              <Link href="/coordenacao/vinculos" className="text-sm text-roxo-escuro">
                Limpar
              </Link>
            </div>
          </form>
        </Painel>
        {turma ? (
          <Painel
            titulo={turma.nome}
            descricao={`${turma.serie} · ${turma.periodo} · ${turma.alunos} alunos`}
            acao={{ href: `/coordenacao/turmas/${turma.id}`, rotulo: "Ver turma" }}
          >
            <VinculosDaTurma
              key={turma.id}
              turmaId={turma.id}
              turmaNome={turma.nome}
              professores={turma.professores}
              disponiveis={v.professores.filter((p) => !turma.professores.some((x) => x.id === p.id))}
            />
          </Painel>
        ) : (
          <Painel titulo="Nenhuma turma">
            <p className="text-sm text-texto-suave">A lista segue o segmento do seu acesso e os filtros escolhidos.</p>
          </Painel>
        )}
      </div>
    </div>
  );
}
