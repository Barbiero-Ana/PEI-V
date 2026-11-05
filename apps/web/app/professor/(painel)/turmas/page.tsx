import { redirect } from "next/navigation";
import { listaDeTurmas, professorLogado } from "@/lib/painel/dados";

/** A seção Turmas abre direto na primeira turma; as outras ficam no painel ao lado. */
export default async function Turmas() {
  const professor = await professorLogado();
  const [primeira] = await listaDeTurmas(professor);
  if (!primeira) return <p className="text-texto">Nenhuma turma cadastrada para você ainda.</p>;
  redirect(`/professor/turmas/${primeira.turma.id}`);
}
