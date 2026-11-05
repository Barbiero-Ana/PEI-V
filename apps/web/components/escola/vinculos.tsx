import { FormularioAcao } from "./formulario";
import { desvincular, vincular } from "@/app/coordenacao/acoes";

/**
 * Professores de uma turma, com tirar e vincular. Usado na página de vínculos
 * e na ficha da turma da coordenação.
 */
export function VinculosDaTurma({
  turmaId,
  turmaNome,
  professores,
  disponiveis,
}: {
  turmaId: string;
  turmaNome: string;
  professores: { id: string; nome: string; disciplina: string | null }[];
  disponiveis: { id: string; nome: string; disciplina: string | null }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {professores.length === 0 ? (
        <p className="rounded-xl bg-pessego-claro px-4 py-3 text-sm text-tinta">
          Esta turma ainda não tem professor: nenhum professor vê os alunos dela no painel.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {professores.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-suave/70 px-4 py-2.5"
            >
              <span>
                <span className="block font-semibold text-tinta">{p.nome}</span>
                {p.disciplina ? <span className="block text-xs text-texto-suave">{p.disciplina}</span> : null}
              </span>
              <FormularioAcao
                acao={desvincular.bind(null, turmaId, p.id)}
                botao="Tirar da turma"
                variante="perigo"
                confirmar={`Tirar ${p.nome} da turma ${turmaNome}? O histórico continua.`}
              />
            </li>
          ))}
        </ul>
      )}
      {disponiveis.length > 0 ? (
        <FormularioAcao acao={vincular.bind(null, turmaId)} botao="Vincular" variante="secundario">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`vincular-${turmaId}`} className="text-sm font-semibold text-tinta">
              Vincular professor
            </label>
            <select
              id={`vincular-${turmaId}`}
              name="professorId"
              defaultValue=""
              className="h-11 w-full rounded-xl border border-borda-forte bg-fundo px-3.5 text-tinta outline-none focus:border-roxo"
            >
              <option value="" disabled>
                Escolha o professor
              </option>
              {disponiveis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.disciplina ? ` · ${p.disciplina}` : ""}
                </option>
              ))}
            </select>
          </div>
        </FormularioAcao>
      ) : (
        <p className="text-sm text-texto-suave">Todos os professores ativos já estão nesta turma.</p>
      )}
    </div>
  );
}
