"use client";

import { useId, useState } from "react";
import { normalizarBusca } from "@modolume/core";
import { CAMPO, ROTULO, FormularioAcao } from "./formulario";
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
  const [busca, setBusca] = useState("");
  const [materia, setMateria] = useState("");
  const [professorId, setProfessor] = useState("");
  const id = useId();
  const materias = [...new Set(disponiveis.flatMap((p) => (p.disciplina ? [p.disciplina] : [])))].sort((a, b) =>
    a.localeCompare(b),
  );
  const termo = normalizarBusca(busca);
  const encontrados = disponiveis.filter(
    (p) => (!materia || p.disciplina === materia) && normalizarBusca(p.nome).includes(termo),
  );
  const escolhido = encontrados.find((p) => p.id === professorId);
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-tinta">
        Professores vinculados{" "}
        <span className="ml-1 rounded-full bg-suave px-2 py-1 text-xs text-texto-suave">{professores.length}</span>
      </h3>
      {professores.length === 0 ? (
        <p className="rounded-xl bg-pessego-claro px-4 py-3 text-sm text-tinta">
          Esta turma ainda está sem professor. Selecione alguém abaixo para liberar a turma no painel docente.
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
                botao="Remover vínculo"
                variante="perigo"
                confirmar={`Remover ${p.nome} de ${turmaNome}? A turma sairá do painel do professor. O histórico será preservado.`}
              />
            </li>
          ))}
        </ul>
      )}
      {disponiveis.length > 0 ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-borda bg-fundo p-4">
          <h3 className="font-semibold text-tinta">Adicionar professor à turma</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-busca`} className={ROTULO}>
                Buscar professor
              </label>
              <input
                id={`${id}-busca`}
                className={CAMPO}
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-materia`} className={ROTULO}>
                Matéria
              </label>
              <select
                id={`${id}-materia`}
                className={CAMPO}
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
              >
                <option value="">Todas</option>
                {materias.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <FormularioAcao
            acao={vincular.bind(null, turmaId)}
            botao="Vincular professor"
            desabilitado={!escolhido}
            atualizarAoSalvar
            confirmar={() => `Vincular ${escolhido?.nome} a ${turmaNome}? A turma aparecerá no painel do professor.`}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`vincular-${turmaId}`} className="text-sm font-semibold text-tinta">
                Professor disponível
              </label>
              <select
                id={`vincular-${turmaId}`}
                name="professorId"
                value={escolhido?.id ?? ""}
                onChange={(e) => setProfessor(e.target.value)}
                className={CAMPO}
              >
                <option value="" disabled>
                  {encontrados.length ? "Escolha o professor" : "Nenhum professor com esses filtros"}
                </option>
                {encontrados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                    {p.disciplina ? ` · ${p.disciplina}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </FormularioAcao>
        </section>
      ) : (
        <p className="text-sm text-texto-suave">Não há outros professores ativos disponíveis para esta turma.</p>
      )}
    </div>
  );
}
