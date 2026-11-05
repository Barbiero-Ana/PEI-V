"use client";

import { useActionState } from "react";
import { trocarSenha, type EstadoSenha } from "../acoes";

const CAMPO =
  "h-12 w-full rounded-xl border border-borda-forte bg-fundo px-4 text-tinta outline-none transition-[border-color,box-shadow] focus:border-roxo focus:bg-superficie focus:shadow-[0_0_0_4px_rgb(123_97_255/0.15)]";

export function FormularioSenha() {
  const [estado, enviar, enviando] = useActionState<EstadoSenha, FormData>(trocarSenha, { erro: null });
  return (
    <form action={enviar} className="flex flex-col gap-5" noValidate>
      {[
        ["atual", "Senha atual", "current-password"],
        ["nova", "Nova senha", "new-password"],
        ["confirma", "Repita a nova senha", "new-password"],
      ].map(([nome, rotulo, auto]) => (
        <div key={nome} className="flex flex-col gap-2">
          <label htmlFor={nome} className="text-sm font-semibold text-tinta">
            {rotulo}
          </label>
          <input id={nome} name={nome} type="password" autoComplete={auto} required className={CAMPO} />
        </div>
      ))}
      <p className="-mt-2 text-sm text-texto-suave">Pelo menos 8 caracteres, com letras e números.</p>
      {estado.erro ? (
        <p role="alert" className="rounded-xl border border-pessego bg-pessego-claro px-4 py-3 text-sm text-tinta">
          {estado.erro}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={enviando}
        className="h-12 rounded-xl bg-roxo font-display font-semibold text-white hover:bg-roxo-escuro disabled:opacity-60"
      >
        {enviando ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
