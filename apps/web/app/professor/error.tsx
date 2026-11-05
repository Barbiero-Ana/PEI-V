"use client";

/** Erro fora do painel (por exemplo, na tela de entrada do professor). */
export default function ErroProfessor({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F1EFF8] px-6">
      <div className="max-w-md rounded-2xl bg-superficie p-8" role="alert">
        <h1 className="text-xl">Não foi possível abrir o painel do professor</h1>
        <p className="mt-2 text-sm text-texto">Tente de novo em instantes.</p>
        {error.digest ? <p className="mt-3 text-xs text-texto-suave">Código: {error.digest}</p> : null}
        <button
          type="button"
          onClick={reset}
          className="mt-5 h-11 rounded-full bg-tinta px-5 text-sm font-semibold text-white"
        >
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
