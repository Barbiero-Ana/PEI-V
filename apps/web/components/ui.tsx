import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "primario" | "secundario" | "destaque" | "fantasma";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-roxo text-white shadow-[var(--shadow-botao)] hover:bg-roxo-escuro",
  destaque: "bg-pessego text-tinta hover:bg-[#ff9d66]",
  secundario: "bg-superficie text-tinta border border-borda-forte hover:bg-suave",
  fantasma: "text-texto-suave hover:bg-suave hover:text-tinta",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-[0.95rem] font-semibold transition-[background-color,transform,box-shadow] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";

export function Botao({
  variante = "primario",
  className = "",
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return <button {...props} className={`${BASE} ${VARIANTES[variante]} ${className}`} />;
}

export function BotaoLink({
  variante = "primario",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link {...props} className={`${BASE} ${VARIANTES[variante]} ${className}`} />;
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-borda bg-superficie shadow-[var(--shadow-cartao)] ${className}`}>
      {children}
    </section>
  );
}

export function Rotulo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-texto-suave ${className}`}>
      {children}
    </p>
  );
}

export const COR_MISSAO = {
  roxo: { claro: "bg-roxo-claro", forte: "#7B61FF", texto: "text-roxo" },
  pessego: { claro: "bg-pessego-claro", forte: "#FFAC7A", texto: "text-pessego-escuro" },
  azul: { claro: "bg-azul-claro", forte: "#8FD3FF", texto: "text-azul-escuro" },
  lilas: { claro: "bg-lilas-claro", forte: "#C9B4FF", texto: "text-roxo" },
} as const;
