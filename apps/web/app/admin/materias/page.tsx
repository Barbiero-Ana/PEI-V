import { Cabecalho, Painel } from "@/components/painel/blocos";
import { Campo, FormularioAcao } from "@/components/escola/formulario";
import { apiDaEquipe } from "@/lib/escola/api";
import type { Materia } from "@/lib/escola/tipos";
import { criarMateria } from "../acoes";

export default async function Materias() {
  const materias = await apiDaEquipe<Materia[]>("/admin/materias");
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Matérias"
        descricao="Cadastre as matérias da escola que podem ser selecionadas no cadastro de professores."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(260px,0.8fr)_1.2fr]">
        <Painel titulo="Cadastrar matéria">
          <FormularioAcao acao={criarMateria} botao="Cadastrar matéria" atualizarAoSalvar>
            <Campo nome="nome" rotulo="Nome da matéria" dica="Exemplo: Ciências" />
          </FormularioAcao>
        </Painel>
        <Painel titulo={`Catálogo da escola (${materias.length})`} semRecuo>
          {materias.length ? (
            <ul className="divide-y divide-borda">
              {materias.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <span className="font-semibold text-tinta">{m.nome}</span>
                  <span className="rounded-full bg-suave px-3 py-1 text-xs text-texto-suave">
                    {m._count.professores} {m._count.professores === 1 ? "professor ativo" : "professores ativos"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-texto-suave">Cadastre a primeira matéria para começar.</p>
          )}
        </Painel>
      </div>
    </div>
  );
}
