"use client";

import { useActionState, useEffect, useState } from "react";
import { recuperarAcesso } from "./acoes";
import { CAMPO } from "@/components/escola/formulario";

export function FormularioRecuperacao() {
  const [token, definirToken] = useState("");
  const [estado, enviar, enviando] = useActionState(recuperarAcesso, { mensagem: "" });
  useEffect(() => {
    definirToken(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  return (
    <form action={enviar} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {token ? (
        <>
          <label>
            Nova senha
            <input className={CAMPO} name="nova" type="password" minLength={8} required autoComplete="new-password" />
          </label>
          <label>
            Confirmar senha
            <input className={CAMPO} name="confirmacao" type="password" required autoComplete="new-password" />
          </label>
          <p className="text-sm">Use pelo menos 8 caracteres, com letras e números.</p>
        </>
      ) : (
        <label>
          E-mail cadastrado
          <input className={CAMPO} name="email" type="email" required autoComplete="email" />
        </label>
      )}
      <button className="min-h-11 rounded-xl bg-roxo px-4 text-white disabled:opacity-60" disabled={enviando}>
        {enviando ? "Aguarde…" : token ? "Definir senha" : "Solicitar link"}
      </button>
      <p role={estado.erro ? "alert" : "status"}>{estado.mensagem}</p>
    </form>
  );
}
