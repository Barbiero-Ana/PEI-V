import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Estrutura } from "@/components/escola/estrutura";

export const metadata: Metadata = { title: "Coordenação · Modolume" };

/** Área da coordenação: acompanha a escola e vincula professores às turmas. */
export default function LayoutCoordenacao({ children }: { children: ReactNode }) {
  return <Estrutura area="coordenacao">{children}</Estrutura>;
}
