"use client";
import { useActionState } from "react";
import { alterarPrazo } from "@/app/professor/(painel)/atividades/[id]/editar/acoes";
import { CAMPO } from "@/components/escola/formulario";

export function FormularioPrazo({ id, prazo, inicio }: { id: string; prazo: string; inicio: string }) {
  const [estado, acao, pendente] = useActionState(alterarPrazo.bind(null, id), { erro: "", sucesso: "" });
  return (
    <form action={acao} className="flex max-w-xl flex-col gap-4 rounded-2xl bg-superficie p-5 sombra-suave">
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Data limite
        <input type="date" name="prazo" min={inicio} defaultValue={prazo} className={CAMPO} />
      </label>
      <p className="text-sm text-texto-suave">
        Deixe em branco para remover o prazo. As questões, turmas e a data de início permanecem preservadas nesta
        publicação.
      </p>
      {estado.erro ? (
        <p role="alert" className="text-alerta">
          {estado.erro}
        </p>
      ) : null}
      {estado.sucesso ? <p role="status">{estado.sucesso}</p> : null}
      <button
        type="submit"
        disabled={pendente}
        className="min-h-11 self-start rounded-xl bg-roxo px-4 font-semibold text-white hover:bg-roxo-escuro disabled:opacity-50"
      >
        {pendente ? "Salvando…" : "Salvar prazo"}
      </button>
    </form>
  );
}
