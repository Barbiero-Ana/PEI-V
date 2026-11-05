"use client";

import { useActionState, type ReactNode } from "react";
import type { ResultadoAcao } from "@/lib/escola/api";

/** Classes dos campos das áreas da equipe (iguais às do login). */
export const CAMPO =
  "h-11 w-full rounded-xl border border-borda-forte bg-fundo px-3.5 text-tinta outline-none transition-[border-color,box-shadow] focus:border-roxo focus:bg-superficie focus:shadow-[0_0_0_4px_rgb(123_97_255/0.15)]";
export const ROTULO = "text-sm font-semibold text-tinta";

const CORES = {
  primario: "bg-roxo text-white hover:bg-roxo-escuro",
  secundario: "border border-borda-forte bg-superficie text-tinta hover:bg-suave",
  perigo: "border border-pessego-escuro/50 bg-superficie text-alerta hover:bg-pessego-claro",
};

/**
 * Formulário ligado a uma ação do servidor: mostra o erro da API ou a
 * confirmação, e a senha provisória ou o código quando a ação devolve um.
 */
export function FormularioAcao({
  acao,
  children,
  botao,
  variante = "primario",
  className = "",
  confirmar,
}: {
  acao: (anterior: ResultadoAcao | null, form: FormData) => Promise<ResultadoAcao>;
  children?: ReactNode;
  botao: string;
  variante?: keyof typeof CORES;
  className?: string;
  /** Pergunta de confirmação antes de enviar (ações que tiram acesso). */
  confirmar?: string;
}) {
  const [estado, enviar, enviando] = useActionState(acao, null);
  return (
    <form
      action={enviar}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className={`flex flex-col gap-4 ${className}`}
      noValidate
    >
      {children}
      <div>
        <button
          type="submit"
          disabled={enviando}
          className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-display text-sm font-semibold transition-colors disabled:opacity-60 ${CORES[variante]}`}
        >
          {enviando ? "Salvando…" : botao}
        </button>
      </div>
      <div aria-live="polite">
        {estado && !estado.ok ? (
          <p role="alert" className="rounded-xl border border-pessego bg-pessego-claro px-4 py-3 text-sm text-tinta">
            {estado.erro}
          </p>
        ) : null}
        {estado?.ok ? (
          <div className="rounded-xl bg-roxo-claro px-4 py-3 text-sm text-tinta">
            <p>{estado.mensagem}</p>
            {estado.senha ? (
              <p className="mt-2">
                Senha provisória:{" "}
                <span className="select-all rounded-lg bg-superficie px-2 py-1 font-mono text-base font-semibold tracking-wider">
                  {estado.senha}
                </span>
              </p>
            ) : null}
            {estado.codigo ? (
              <p className="mt-2">
                Código de acesso ao app:{" "}
                <span className="select-all rounded-lg bg-superficie px-2 py-1 font-mono text-base font-semibold tracking-wider">
                  {estado.codigo.slice(0, 4)}-{estado.codigo.slice(4)}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}

/** Campo com rótulo em cima. */
export function Campo({
  nome,
  rotulo,
  tipo = "text",
  valor,
  obrigatorio = true,
  dica,
}: {
  nome: string;
  rotulo: string;
  tipo?: string;
  valor?: string | number | null;
  obrigatorio?: boolean;
  dica?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`campo-${nome}`} className={ROTULO}>
        {rotulo}
        {!obrigatorio ? <span className="font-normal text-texto-fraco"> (opcional)</span> : null}
      </label>
      <input
        id={`campo-${nome}`}
        name={nome}
        type={tipo}
        defaultValue={valor ?? ""}
        required={obrigatorio}
        className={CAMPO}
      />
      {dica ? <p className="text-xs text-texto-suave">{dica}</p> : null}
    </div>
  );
}

/** Lista de opções com rótulo em cima. */
export function Escolha({
  nome,
  rotulo,
  opcoes,
  valor,
}: {
  nome: string;
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  valor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`campo-${nome}`} className={ROTULO}>
        {rotulo}
      </label>
      <select id={`campo-${nome}`} name={nome} defaultValue={valor ?? opcoes[0]?.valor} className={CAMPO}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}
