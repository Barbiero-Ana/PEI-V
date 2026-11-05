import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorAtividade } from "@/components/painel/editor-atividade";
import { IconeVoltar } from "@/components/painel/icones";
import { dataCurta } from "@/components/painel/blocos";
import { SOBRE_FORMATOS, buscarAtividade } from "@/lib/painel/atividades";
import { opcoesDePlanejamento, professorLogado } from "@/lib/painel/dados";
import { HABILIDADES_BNCC, atividadesDoApp, listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Editar atividade · Painel do professor · Modolume" };

export default async function EditarAtividade({ params }: { params: Promise<{ id: string }> }) {
  const professor = await professorLogado();
  const { id } = await params;
  const [atividade, turmas, planos] = await Promise.all([
    buscarAtividade(professor, id),
    opcoesDePlanejamento(professor),
    listarPlanos(professor),
  ]);
  if (!atividade) notFound();
  const { id: _i, professorId: _p, status: _s, enviadaEm: _e, atualizadaEm: _a, ...dados } = atividade;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={`/professor/atividades/${atividade.id}`}
        className="inline-flex items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> {atividade.titulo}
      </Link>
      <div>
        <h1 className="text-[1.75rem] leading-tight">Editar atividade</h1>
        {atividade.status === "enviada" ? (
          <p className="mt-1 text-sm text-alerta">
            Esta atividade já foi enviada. Ao salvar, a versão nova é a que passa a valer no app.
          </p>
        ) : null}
      </div>
      <EditorAtividade
        id={atividade.id}
        inicial={dados}
        turmas={turmas}
        planos={planos.map((p) => ({
          id: p.id,
          rotulo: `${dataCurta(p.data)} · ${turmas.find((t) => t.id === p.turmaId)?.nome} · ${p.tema}`,
        }))}
        habilidades={HABILIDADES_BNCC}
        missoes={atividadesDoApp()}
        sobre={SOBRE_FORMATOS}
      />
    </div>
  );
}
