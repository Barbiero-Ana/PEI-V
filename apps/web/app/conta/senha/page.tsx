import type { Metadata } from "next";
import Link from "next/link";
import { Simbolo } from "@/components/simbolo";
import { NomeMarca } from "@/components/logo";
import { INICIO_DO_PAPEL, papelDa } from "@/lib/painel/sessao";
import { sessaoDaEquipe } from "@/lib/escola/api";
import { FormularioSenha } from "./formulario";

export const metadata: Metadata = { title: "Trocar senha · Modolume" };

export default async function TrocarSenha() {
  const sessao = await sessaoDaEquipe();
  const obrigatoria = Boolean(sessao?.trocarSenha);
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-fundo px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-[radial-gradient(circle_at_40%_40%,#EDE5FF,transparent_65%)]"
      />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-6 flex items-center justify-between">
          <span className="inline-flex items-end gap-2">
            <Simbolo tamanho={30} rotulo="" />
            <NomeMarca className="text-[1.3rem] leading-none" />
          </span>
          {!obrigatoria && sessao ? (
            <Link
              href={INICIO_DO_PAPEL[papelDa(sessao)]}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-texto-suave hover:bg-suave"
            >
              ← Voltar ao painel
            </Link>
          ) : null}
        </div>
        <div className="rounded-[2rem] border border-borda bg-superficie p-7 shadow-[0_40px_80px_-50px_rgb(30_42_120/0.55)] sm:p-9">
          <h1 className="text-[1.6rem]">{obrigatoria ? "Crie a sua senha" : "Trocar senha"}</h1>
          <p className="mt-1 text-texto-suave">
            {obrigatoria
              ? "Você entrou com uma senha provisória. Antes de continuar, crie uma senha só sua."
              : "Use uma senha que só você saiba."}
          </p>
          <div className="mt-7">
            <FormularioSenha />
          </div>
        </div>
      </div>
    </main>
  );
}
