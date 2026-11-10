import Link from "next/link";
import { Avatar, ChipResultado, LIMITE_ATENCAO, Variacao, dataCurta, pct } from "./blocos";

/** Resumo de um aluno, mostrado ao parar o mouse sobre o nome dele. */
export function CartaoResumoAluno({
  aluno,
  comLink = true,
}: {
  /** Sem link quando o cartão já está dentro de um link (a linha inteira abre a ficha). */
  comLink?: boolean;
  aluno: {
    alunoId: string;
    nome: string;
    codigo: string;
    turmaNome: string;
    acertoMedio: number;
    tendencia: number;
    atividades: number;
    rendeMais?: string | null;
    dificuldade?: string | null;
    motivo?: string | null;
    recentes?: { id: string; acerto: number; data: string; titulo: string }[];
    avatarSvg?: string | null;
  };
}) {
  return (
    <span className="flex flex-col gap-3">
      <span className="flex items-center gap-3">
        <Avatar nome={aluno.nome} tamanho={40} svg={aluno.avatarSvg} />
        <span className="min-w-0">
          <span className="block font-semibold text-tinta">{aluno.nome}</span>
          <span className="block text-xs text-texto-suave">
            {aluno.turmaNome} · matrícula {aluno.codigo}
          </span>
        </span>
      </span>

      <span className="grid grid-cols-2 gap-2">
        <span className="rounded-xl bg-[#F3F1FA] px-3 py-2">
          <span className="block text-xs text-texto-suave">Acerto médio</span>
          <span
            className={`tnum font-display text-lg font-semibold ${aluno.acertoMedio < LIMITE_ATENCAO ? "text-alerta" : "text-tinta"}`}
          >
            {pct(aluno.acertoMedio)}
          </span>
        </span>
        <span className="rounded-xl bg-[#F3F1FA] px-3 py-2">
          <span className="block text-xs text-texto-suave">Variação</span>
          <span className="font-display text-lg font-semibold">
            <Variacao pontos={aluno.tendencia} />
          </span>
        </span>
      </span>

      <span className="flex flex-col gap-1 text-sm">
        {aluno.rendeMais ? (
          <span className="text-texto">
            <span className="text-texto-suave">Rende mais em </span>
            <span className="font-semibold text-tinta">{aluno.rendeMais}</span>
          </span>
        ) : null}
        {aluno.dificuldade ? (
          <span className="text-texto">
            <span className="text-texto-suave">Mais dificuldade em </span>
            <span className="font-semibold text-tinta">{aluno.dificuldade}</span>
          </span>
        ) : null}
        <span className="text-xs text-texto-suave">{aluno.atividades} atividades no período</span>
      </span>

      {aluno.motivo ? (
        <span className="rounded-xl bg-pessego-claro px-3 py-2 text-xs text-[#8A3A0E]">
          <strong>Pede atenção:</strong> {aluno.motivo.toLowerCase()}
        </span>
      ) : null}

      {aluno.recentes?.length ? (
        <span>
          <span className="mb-1 block text-xs text-texto-suave">Últimas atividades</span>
          <span className="flex flex-wrap gap-1">
            {aluno.recentes.map((r) => (
              <ChipResultado key={r.id} valor={r.acerto} titulo={`${r.titulo} · ${dataCurta(r.data)}`} />
            ))}
          </span>
        </span>
      ) : null}

      {comLink ? (
        <Link href={`/professor/alunos/${aluno.alunoId}`} className="text-sm font-semibold text-roxo-escuro">
          Abrir ficha do aluno ›
        </Link>
      ) : (
        <span className="text-xs text-texto-suave">Clique na linha para abrir a ficha</span>
      )}
    </span>
  );
}
