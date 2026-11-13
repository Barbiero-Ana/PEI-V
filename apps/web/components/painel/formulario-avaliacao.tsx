"use client";
import { useActionState, useEffect, useState } from "react";
import { PERCEPCOES_HABILIDADE } from "@modolume/core";
import { salvarAvaliacao } from "@/app/professor/(painel)/atividades/[id]/alunos/[alunoId]/acoes";

export function FormularioAvaliacao({
  atividadeId,
  alunoId,
  jogadaId,
  feedback,
  percepcao,
  habilidade,
}: {
  atividadeId: string;
  alunoId: string;
  jogadaId: string;
  feedback: string;
  percepcao: string | null;
  habilidade: string | null;
}) {
  const [id, definirId] = useState("");
  const [estado, acao, pendente] = useActionState(salvarAvaliacao.bind(null, atividadeId, alunoId), {
    erro: "",
    sucesso: "",
  });
  useEffect(() => {
    definirId(crypto.randomUUID());
  }, [estado]);
  return (
    <form action={acao} className="flex flex-col gap-4 rounded-2xl bg-superficie p-5 sombra-suave">
      <h2 className="text-lg">Sua devolutiva</h2>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="jogadaId" value={jogadaId} />
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Orientação para o aluno
        <textarea
          name="feedback"
          defaultValue={feedback}
          maxLength={2000}
          rows={5}
          className="rounded-xl border border-[#D9D4EC] p-3 font-normal"
          placeholder="Mostre o que ele já conseguiu e indique um próximo passo concreto."
        />
      </label>
      {habilidade ? (
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Percepção sobre {habilidade}
          <select
            name="percepcao"
            defaultValue={percepcao ?? ""}
            className="h-11 rounded-xl border border-[#D9D4EC] px-3 font-normal"
          >
            <option value="">Sem registro de percepção</option>
            {PERCEPCOES_HABILIDADE.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {estado.erro ? (
        <p role="alert" className="text-sm text-alerta">
          {estado.erro}
        </p>
      ) : null}
      {estado.sucesso ? (
        <p role="status" className="text-sm text-[#24704A]">
          {estado.sucesso}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          disabled={pendente || !id}
          name="publicar"
          value="nao"
          className="h-11 rounded-xl border border-[#D9D4EC] px-4 font-semibold"
        >
          Salvar rascunho
        </button>
        <button
          disabled={pendente || !id}
          name="publicar"
          value="sim"
          className="h-11 rounded-xl bg-roxo px-4 font-semibold text-white"
        >
          {pendente ? "Salvando…" : "Concluir e publicar"}
        </button>
      </div>
      <p className="text-xs text-texto-suave">
        Publicar preserva a versão no histórico. Um novo salvamento cria outra versão.
      </p>
    </form>
  );
}
