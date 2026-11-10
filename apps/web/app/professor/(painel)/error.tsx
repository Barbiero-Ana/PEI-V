"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Erro ao carregar uma página do painel: mantém o menu e oferece tentar de novo. */
export default function ErroPainel({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 py-10" role="alert">
      <div>
        <h1 className="text-[1.75rem] leading-tight">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-texto">
          Aconteceu um erro no painel. O que você já tinha salvo continua salvo. Tente de novo; se continuar, avise a
          equipe do Modolume com o código abaixo.
        </p>
      </div>
      {error.digest ? (
        <p className="rounded-lg bg-[#F3F1FA] px-3 py-2 text-sm text-texto">
          Código do erro: <span className="tnum font-semibold text-tinta">{error.digest}</span>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-full bg-tinta px-5 text-sm font-semibold text-white"
        >
          Tentar de novo
        </button>
        <Link
          href="/professor"
          className="inline-flex h-11 items-center rounded-full border border-[#D9D4EC] bg-superficie px-5 text-sm font-semibold text-tinta"
        >
          Ir para a visão geral
        </Link>
      </div>
    </div>
  );
}
