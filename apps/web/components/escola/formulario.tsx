"use client";

import { useActionState, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { formatarCodigoAcesso } from "@modolume/core";
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
  atualizarAoSalvar = false,
  desabilitado = false,
}: {
  acao: (anterior: ResultadoAcao | null, form: FormData) => Promise<ResultadoAcao>;
  children?: ReactNode;
  botao: string;
  variante?: keyof typeof CORES;
  className?: string;
  /** Pergunta de confirmação antes de enviar (ações que tiram acesso). */
  confirmar?: string | ((form: FormData) => string);
  /** Recarrega os dados do servidor depois de uma edição bem-sucedida. */
  atualizarAoSalvar?: boolean;
  desabilitado?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const confirmado = useRef(false);
  const tituloId = useId();
  const mensagemId = useId();
  const [mensagemConfirmacao, definirMensagem] = useState("");
  const [estado, enviar, enviando] = useActionState(async (anterior: ResultadoAcao | null, form: FormData) => {
    const resultado = await acao(anterior, form);
    if (resultado.ok && atualizarAoSalvar) router.refresh();
    return resultado;
  }, null);
  return (
    <>
      <form
        ref={formRef}
        action={enviar}
        onSubmit={(e) => {
          if (!confirmar) return;
          if (confirmado.current) {
            confirmado.current = false;
            return;
          }
          e.preventDefault();
          definirMensagem(typeof confirmar === "function" ? confirmar(new FormData(e.currentTarget)) : confirmar);
          dialogo.current?.showModal();
        }}
        className={`flex flex-col gap-4 ${className}`}
        noValidate
      >
        {children}
        <div>
          <button
            type="submit"
            disabled={enviando || desabilitado}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 font-display text-sm font-semibold transition-colors disabled:opacity-60 ${CORES[variante]}`}
          >
            {enviando ? "Salvando…" : botao}
          </button>
        </div>
        {estado ? (
          <div aria-live="polite">
            {estado && !estado.ok ? (
              <p
                role="alert"
                className="rounded-xl border border-pessego bg-pessego-claro px-4 py-3 text-sm text-tinta"
              >
                {estado.erro}
              </p>
            ) : null}
            {estado?.ok ? (
              <div className="rounded-xl bg-roxo-claro px-4 py-3 text-sm text-tinta">
                <p>{estado.mensagem}</p>
                {estado.codigo ? (
                  <p className="mt-2">
                    Código de acesso ao app:{" "}
                    <span className="select-all rounded-lg bg-superficie px-2 py-1 font-mono text-base font-semibold tracking-wider">
                      {formatarCodigoAcesso(estado.codigo)}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </form>
      {confirmar ? (
        <dialog
          ref={dialogo}
          aria-labelledby={tituloId}
          aria-describedby={mensagemId}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-borda bg-superficie p-6 text-tinta shadow-xl backdrop:bg-tinta/40"
        >
          <h2 id={tituloId} className="text-lg">
            Confirmar ação
          </h2>
          <p id={mensagemId} className="mt-2 text-sm text-texto">
            {mensagemConfirmacao}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              autoFocus
              className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${CORES.secundario}`}
              onClick={() => dialogo.current?.close()}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${CORES[variante === "perigo" ? "perigo" : "primario"]}`}
              onClick={() => {
                dialogo.current?.close();
                confirmado.current = true;
                formRef.current?.requestSubmit();
              }}
            >
              {botao}
            </button>
          </div>
        </dialog>
      ) : null}
    </>
  );
}

/** Campo com rótulo em cima. */
export function Campo({
  nome,
  rotulo,
  tipo = "text",
  valor,
  obrigatorio = true,
  somenteLeitura = false,
  dica,
}: {
  nome: string;
  rotulo: string;
  tipo?: string;
  valor?: string | number | null;
  obrigatorio?: boolean;
  somenteLeitura?: boolean;
  dica?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={ROTULO}>
        {rotulo}
        {!obrigatorio ? <span className="font-normal text-texto-fraco"> (opcional)</span> : null}
      </label>
      <input
        id={id}
        name={nome}
        type={tipo}
        defaultValue={valor ?? ""}
        required={obrigatorio}
        readOnly={somenteLeitura}
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
  desabilitado = false,
}: {
  nome: string;
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  valor?: string;
  desabilitado?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={ROTULO}>
        {rotulo}
      </label>
      <select id={id} name={nome} defaultValue={valor ?? opcoes[0]?.valor} disabled={desabilitado} className={CAMPO}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}
