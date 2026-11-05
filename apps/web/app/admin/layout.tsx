import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Estrutura } from "@/components/escola/estrutura";

export const metadata: Metadata = { title: "Administração · Modolume" };

/** Área do administrador: equipe e permissões, turmas, alunos e registro de atividades. */
export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return <Estrutura area="admin">{children}</Estrutura>;
}
