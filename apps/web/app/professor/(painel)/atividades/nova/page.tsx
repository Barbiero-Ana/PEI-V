import { dataEscolar } from "@modolume/core";
import type { Metadata } from "next";
import Link from "next/link";
import { EditorAtividade } from "@/components/painel/editor-atividade";
import { IconeVoltar } from "@/components/painel/icones";
import { dataCurta } from "@/components/painel/blocos";
import { FORMATOS_EDITAVEIS, SOBRE_FORMATOS, type DadosAtividade, type FormatoEditavel } from "@/lib/painel/atividades";
import { opcoesDePlanejamento, professorLogado } from "@/lib/painel/dados";
import { HABILIDADES_BNCC, atividadesDoApp, buscarPlano, listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Nova atividade · Painel do professor · Modolume" };

export default async function NovaAtividade({
  searchParams,
}: {
  searchParams: Promise<{ formato?: string; turma?: string; plano?: string }>;
}) {
  const professor = await professorLogado();
  const { formato = "", turma = "", plano: planoId = "" } = await searchParams;
  const [turmas, planos, plano] = await Promise.all([
    opcoesDePlanejamento(professor),
    listarPlanos(professor),
    planoId ? buscarPlano(professor, planoId) : null,
  ]);

  // vinda de um plano: turma, tema, habilidade, data e o primeiro formato editável do plano
  const doPlano = plano?.formatos.find((f) => (FORMATOS_EDITAVEIS as readonly string[]).includes(f)) as
    FormatoEditavel | undefined;
  const formatoInicial: FormatoEditavel = (FORMATOS_EDITAVEIS as readonly string[]).includes(formato)
    ? (formato as FormatoEditavel)
    : (doPlano ?? "objetiva");
  const turmaInicial = plano?.turmaId ?? (turmas.some((t) => t.id === turma) ? turma : turmas[0]?.id);

  const vazia = {
    objetiva: [{ tipo: "objetiva" as const, enunciado: "", alternativas: ["", "", "", ""], correta: 0 }],
    completar: [{ tipo: "completar" as const, comando: "", texto: "" }],
    "associacao-visual": [
      {
        tipo: "associacao-visual" as const,
        comando: "",
        pares: [
          { a: "", b: "" },
          { a: "", b: "" },
          { a: "", b: "" },
        ],
      },
    ],
    sequencia: [{ tipo: "sequencia" as const, comando: "", itens: ["", "", ""] }],
    pronta: [],
  }[formatoInicial];

  const inicial: DadosAtividade = {
    titulo: plano?.tema ?? "",
    formato: formatoInicial,
    instrucao: "",
    habilidade: plano?.habilidades[0] ?? "",
    missaoId: formatoInicial === "pronta" ? (plano?.atividadesApp[0] ?? "") : "",
    questoes: vazia,
    turmas: turmaInicial ? [turmaInicial] : [],
    liberarEm: plano?.data ?? dataEscolar(),
    planoId: plano?.id ?? "",
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={plano ? `/professor/planejamento/${plano.id}` : "/professor/atividades"}
        className="inline-flex items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> {plano ? plano.tema : "Atividades"}
      </Link>
      <div>
        <h1 className="text-[1.75rem] leading-tight">Nova atividade</h1>
      </div>
      <EditorAtividade
        inicial={inicial}
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
