import "server-only";
import { chamarApi, usandoApi } from "./api";
import { tokenDaApi } from "./dados";
import type { DadosAtividade } from "@modolume/core";

export interface AvaliacaoProfessor {
  id: string;
  jogadaId: string;
  feedback: string;
  percepcao: string | null;
  publicada: boolean;
  criadaEm: string;
}
export interface DetalheAvaliacao {
  titulo: string;
  habilidade: string | null;
  jogadas: {
    id: string;
    publicacao: { numero: number; conteudo: DadosAtividade } | null;
    titulo: string;
    percentualAcerto: number;
    tentativas: number;
    rodadas: number;
    tempoSegundos: number;
    dicas: number;
    recebidaEm: string;
    fases: { ordem: number; tentativas: number; tempoSegundos: number; dica: boolean }[] | null;
  }[];
  avaliacoes: AvaliacaoProfessor[];
}
export async function detalheAvaliacao(atividadeId: string, alunoId: string) {
  return chamarApi<DetalheAvaliacao>(
    `/professor/atividades/${encodeURIComponent(atividadeId)}/alunos/${encodeURIComponent(alunoId)}`,
    { token: await tokenDaApi() },
  );
}
export async function avaliacoesPendentes() {
  if (!usandoApi()) return [];
  return chamarApi<{ id: string; titulo: string; quantidade: number }[]>("/professor/avaliacoes/pendentes", {
    token: await tokenDaApi(),
  });
}
export async function historicoAvaliacoes(alunoId: string) {
  if (!usandoApi()) return [];
  return chamarApi<(AvaliacaoProfessor & { atividadeId: string; atividade: { titulo: string } })[]>(
    `/professor/alunos/${encodeURIComponent(alunoId)}/avaliacoes`,
    { token: await tokenDaApi() },
  );
}
