import type { Metadata } from "next";
import Link from "next/link";
import { Simbolo } from "@/components/simbolo";
import { Wordmark } from "@/components/logo";
import { OndasFaixa } from "@/components/site/ondas";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar · Modolume" };

export default function EntrarProfessor() {
  return (
    <main className="grid min-h-screen bg-fundo lg:grid-cols-[1fr_1.05fr]">
      {/* apresentação, com as ondas da identidade */}
      <section className="relative hidden items-center justify-center overflow-hidden bg-tinta lg:flex">
        <OndasFaixa id="ondas-login" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgb(155_133_255/0.55),transparent_65%)]"
        />
        {/* só a logo, grande e centralizada */}
        <Link href="/" className="relative flex flex-col items-center gap-5" aria-label="Modolume, página inicial">
          <Simbolo tamanho={150} rotulo="" />
          <Wordmark className="text-[4.5rem] leading-none !text-white xl:text-[5.25rem]" />
        </Link>
      </section>

      {/* formulário */}
      <section className="relative flex flex-col overflow-hidden px-6 py-8 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-[radial-gradient(circle_at_40%_40%,#EDE5FF,transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 size-[420px] rounded-full bg-[radial-gradient(circle_at_60%_40%,#FFE9DB,transparent_65%)]"
        />

        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-end gap-2 lg:invisible" aria-label="Modolume, página inicial">
            <Simbolo tamanho={30} rotulo="" />
            <Wordmark className="text-[1.3rem] leading-none" />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-texto-suave hover:bg-suave hover:text-tinta"
          >
            <span aria-hidden>←</span> Voltar ao site
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px] rounded-[2rem] border border-borda bg-superficie p-7 shadow-[0_40px_80px_-50px_rgb(30_42_120/0.55)] sm:p-9">
            <h2 className="text-[1.7rem]">Boas-vindas!</h2>
            <p className="mt-1 text-texto-suave">
              Professores, coordenação e administração entram por aqui, com o e-mail cadastrado pela escola.
            </p>
            <div className="mt-8">
              <FormularioEntrar />
            </div>
            <div className="mt-7 rounded-2xl bg-suave px-4 py-3 text-sm text-texto">
              <p className="font-semibold text-tinta">Acesso de demonstração (senha modolume2026)</p>
              <ul className="mt-1 flex flex-col gap-0.5 break-words">
                <li>Professora: marina.alves@escola.example</li>
                <li>Coordenação: coordenacao@escola.example</li>
                <li>Administração: admin@escola.example</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="relative text-center text-sm text-texto-fraco">
          Esqueceu a senha? Fale com a coordenação da sua escola.
        </p>
      </section>
    </main>
  );
}
