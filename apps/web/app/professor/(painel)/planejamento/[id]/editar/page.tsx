import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/painel/blocos";
import { FormularioPlano } from "@/components/painel/form-plano";
import { IconeVoltar } from "@/components/painel/icones";
import { opcoesDePlanejamento, professorLogado } from "@/lib/painel/dados";
import { HABILIDADES_BNCC, UNIDADES_TEMATICAS, atividadesDoApp, buscarPlano } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Editar plano de aula · Painel do professor · Modolume" };

export default async function EditarPlano({ params }: { params: Promise<{ id: string }> }) {
  const professor = await professorLogado();
  const { id } = await params;
  const [plano, turmas] = await Promise.all([buscarPlano(professor, id), opcoesDePlanejamento(professor)]);
  if (!plano) notFound();
  const { id: _id, professorId: _p, atualizadoEm: _a, ...dados } = plano;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/professor/planejamento/${plano.id}`}
        className="-mb-2 inline-flex items-center gap-1 self-start text-sm font-medium text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> {plano.tema}
      </Link>
      <Cabecalho titulo="Editar plano de aula" />
      <FormularioPlano
        id={plano.id}
        turmas={turmas}
        habilidades={HABILIDADES_BNCC}
        unidades={UNIDADES_TEMATICAS}
        atividades={atividadesDoApp()}
        inicial={dados}
      />
    </div>
  );
}
