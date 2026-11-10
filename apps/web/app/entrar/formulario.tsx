"use client";

import { useActionState, useState } from "react";
import { entrar, type EstadoEntrar } from "@/app/professor/acoes";

const INICIAL: EstadoEntrar = { erro: null, email: "" };

const CAMPO =
  "h-12 w-full rounded-xl border border-borda-forte bg-fundo px-4 text-tinta outline-none transition-[border-color,box-shadow,background-color] placeholder:text-texto-fraco focus:border-roxo focus:bg-superficie focus:shadow-[0_0_0_4px_rgb(123_97_255/0.15)] aria-[invalid=true]:border-pessego-escuro";

export function FormularioEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, INICIAL);
  const [verSenha, setVerSenha] = useState(false);

  return (
    <form action={acao} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-tinta">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@escola.com.br"
          required
          defaultValue={estado.email}
          aria-invalid={Boolean(estado.erro)}
          aria-describedby={estado.erro ? "erro-entrar" : undefined}
          className={CAMPO}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="text-sm font-semibold text-tinta">
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={verSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(estado.erro)}
            aria-describedby={estado.erro ? "erro-entrar" : undefined}
            className={`${CAMPO} pr-24`}
          />
          <button
            type="button"
            onClick={() => setVerSenha((v) => !v)}
            aria-pressed={verSenha}
            className="absolute right-1.5 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-sm font-semibold text-roxo hover:bg-suave"
          >
            {verSenha ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {estado.erro ? (
        <p
          id="erro-entrar"
          role="alert"
          className="rounded-xl border border-pessego bg-pessego-claro px-4 py-3 text-sm text-tinta"
        >
          {estado.erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="mt-1 h-12 rounded-xl bg-roxo font-display font-semibold text-white shadow-[0_14px_30px_-14px_rgb(123_97_255/0.9)] transition-[background-color,transform] hover:bg-roxo-escuro active:scale-[0.99] disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar no painel"}
      </button>
    </form>
  );
}
