import Link from "next/link";
import { Simbolo } from "@/components/simbolo";
import { Wordmark } from "@/components/logo";
import { CONTATO_EMAIL } from "@/lib/planos";
import { OndaDivisor, OndasFaixa } from "./ondas";

const contato = (assunto: string) => `mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent(assunto)}`;

const COLUNAS: { titulo: string; links: { rotulo: string; href: string; externo?: boolean }[] }[] = [
  {
    titulo: "Produto",
    links: [
      { rotulo: "Como funciona", href: "#como-funciona" },
      { rotulo: "Análise de aprendizagem", href: "#analise" },
      { rotulo: "Planos", href: "#planos" },
    ],
  },
  {
    titulo: "Empresa",
    links: [
      { rotulo: "Sobre o Modolume", href: "#sobre" },
      { rotulo: "Solicite uma demo", href: contato("Quero uma demonstração do Modolume"), externo: true },
      { rotulo: "Fale com vendas", href: contato("Falar com a equipe de vendas"), externo: true },
    ],
  },
  {
    titulo: "Acesso",
    links: [
      { rotulo: "Entrar no painel", href: "/professor/entrar" },
      { rotulo: CONTATO_EMAIL, href: contato("Contato pelo site"), externo: true },
    ],
  },
];

/** Rodapé padrão do site: marca, seções, contato e direitos. */
export function Rodape() {
  const ano = new Date().getFullYear();
  return (
    <footer className="relative mt-8">
      <OndaDivisor id="onda-rodape" cor="#1E2A78" className="-mb-px" />
      <div className="relative overflow-hidden bg-tinta text-white">
        <OndasFaixa id="ondas-rodape" className="opacity-25" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-12 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-end gap-2" aria-label="Modolume, início">
              <Simbolo tamanho={40} rotulo="" />
              <Wordmark className="text-[1.6rem] leading-none !text-white" />
            </Link>
            <p className="mt-4 max-w-xs leading-relaxed text-lilas">
              Ideias que se iluminam. Missões de Matemática para o aluno e um painel que mostra ao professor como cada
              um aprende.
            </p>
          </div>
          {COLUNAS.map((c) => (
            <nav key={c.titulo} aria-label={c.titulo}>
              <p className="font-display font-semibold text-white">{c.titulo}</p>
              <ul className="mt-3 flex flex-col">
                {c.links.map((l) => (
                  <li key={l.rotulo}>
                    {l.externo || l.href.startsWith("#") ? (
                      <a
                        href={l.href}
                        className="inline-flex min-h-10 items-center break-all text-white/75 hover:text-white"
                      >
                        {l.rotulo}
                      </a>
                    ) : (
                      <Link href={l.href} className="inline-flex min-h-10 items-center text-white/75 hover:text-white">
                        {l.rotulo}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-sm text-white/60 sm:px-8">
            <p>© {ano} Modolume. Todos os direitos reservados.</p>
            <p>Dados tratados conforme a LGPD · Fotos: Unsplash</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
