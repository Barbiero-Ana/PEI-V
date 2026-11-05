import { Cabecalho, Painel } from "@/components/painel/blocos";
import { VinculosDaTurma } from "@/components/escola/vinculos";
import { apiDaEquipe } from "@/lib/escola/api";
import type { VisaoCoordenacao } from "@/lib/escola/tipos";

/** Professores e turmas: quem dá aula em qual turma. */
export default async function Vinculos() {
  const v = await apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao");
  // turmas sem professor primeiro
  const turmas = [...v.turmas].sort(
    (a, b) => a.professores.length - b.professores.length || a.nome.localeCompare(b.nome),
  );
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Professores e turmas"
        descricao="Vincule cada professor às turmas em que ele dá aula. O professor passa a ver os alunos da turma no painel na hora; tirar o vínculo não apaga o histórico."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {turmas.map((t) => (
          <Painel key={t.id} titulo={t.nome} descricao={`${t.serie} · ${t.periodo} · ${t.alunos} alunos`}>
            <VinculosDaTurma
              turmaId={t.id}
              turmaNome={t.nome}
              professores={t.professores}
              disponiveis={v.professores.filter((p) => !t.professores.some((x) => x.id === p.id))}
            />
          </Painel>
        ))}
      </div>
      <Painel titulo="Professores da escola" descricao="Quantas turmas cada um tem">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {v.professores.map((p) => (
            <li key={p.id} className="rounded-xl bg-suave/70 px-4 py-2.5">
              <span className="block font-semibold text-tinta">{p.nome}</span>
              <span className="block text-sm text-texto-suave">
                {p.turmas.length === 0
                  ? "Sem turma"
                  : `${p.turmas.length} ${p.turmas.length === 1 ? "turma" : "turmas"}`}
                {p.disciplina ? ` · ${p.disciplina}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </Painel>
    </div>
  );
}
