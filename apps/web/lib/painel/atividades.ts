import "server-only";
import { ATIVIDADES_EXEMPLO, type AtividadeProfessor, type DadosAtividade, type Professor } from "@modolume/core";
import { chamarApi, usandoApi } from "./api";
import { tokenDaApi } from "./dados";

/**
 * Atividades montadas pelo professor e enviadas para o app do aluno. O
 * contrato (formatos, validação e tipos) fica no núcleo, igual para painel, API
 * e app. Com a API ligada, as atividades ficam no banco e chegam ao app; sem
 * ela (demonstração), ficam na memória do servidor.
 */
export {
  FORMATOS_EDITAVEIS,
  SOBRE_FORMATOS,
  esquemaAtividade,
  missaoDa,
  esquemaQuestao,
  type AtividadeProfessor,
  type DadosAtividade,
  type FormatoEditavel,
  type Questao,
} from "@modolume/core";

// guardado no objeto global para sobreviver ao recarregamento do servidor de desenvolvimento
const memoria = globalThis as unknown as { __atividadesModolume?: AtividadeProfessor[] };
const atividades = () => (memoria.__atividadesModolume ??= structuredClone(ATIVIDADES_EXEMPLO));

export async function listarAtividades(professor: Professor, filtro: { planoId?: string } = {}) {
  if (usandoApi())
    return chamarApi<AtividadeProfessor[]>(
      `/professor/atividades${filtro.planoId ? `?planoId=${encodeURIComponent(filtro.planoId)}` : ""}`,
      { token: await tokenDaApi() },
    );
  return atividades()
    .filter((a) => a.professorId === professor.id)
    .filter((a) => !filtro.planoId || a.planoId === filtro.planoId)
    .sort((a, b) => b.liberarEm.localeCompare(a.liberarEm));
}

export async function buscarAtividade(professor: Professor, id: string) {
  if (usandoApi())
    return chamarApi<AtividadeProfessor>(`/professor/atividades/${encodeURIComponent(id)}`, {
      token: await tokenDaApi(),
    }).catch(() => null);
  return atividades().find((a) => a.id === id && a.professorId === professor.id) ?? null;
}

export async function salvarAtividade(professor: Professor, dados: DadosAtividade, id?: string) {
  if (usandoApi())
    return chamarApi<AtividadeProfessor>(
      id ? `/professor/atividades/${encodeURIComponent(id)}` : "/professor/atividades",
      {
        token: await tokenDaApi(),
        metodo: id ? "PUT" : "POST",
        corpo: dados,
      },
    );
  const agora = new Date().toISOString().slice(0, 10);
  if (id) {
    const atual = await buscarAtividade(professor, id);
    if (!atual) return null;
    Object.assign(atual, dados, { atualizadaEm: agora });
    return atual;
  }
  const nova: AtividadeProfessor = {
    ...dados,
    id: `atv-${Date.now()}`,
    professorId: professor.id,
    status: "rascunho",
    enviadaEm: "",
    atualizadaEm: agora,
  };
  atividades().push(nova);
  return nova;
}

export async function mudarEnvio(professor: Professor, id: string, enviar: boolean) {
  if (usandoApi())
    return chamarApi<AtividadeProfessor>(`/professor/atividades/${encodeURIComponent(id)}/envio`, {
      token: await tokenDaApi(),
      metodo: "POST",
      corpo: { enviar },
    });
  const a = await buscarAtividade(professor, id);
  if (!a) return null;
  a.status = enviar ? "enviada" : "rascunho";
  a.enviadaEm = enviar ? new Date().toISOString().slice(0, 10) : "";
  return a;
}

export async function excluirAtividade(professor: Professor, id: string) {
  if (usandoApi()) {
    await chamarApi(`/professor/atividades/${encodeURIComponent(id)}`, { token: await tokenDaApi(), metodo: "DELETE" });
    return;
  }
  const lista = atividades();
  const i = lista.findIndex((a) => a.id === id && a.professorId === professor.id);
  if (i >= 0) lista.splice(i, 1);
}

/** Situação de cada aluno numa atividade enviada (MOD-ATI-010); só com a API. */
export async function situacaoDaAtividade(id: string) {
  if (!usandoApi()) return null;
  return chamarApi<{
    alunos: {
      id: string;
      nome: string;
      turmaId: string;
      avatarSvg: string | null;
      concluiu: boolean;
      situacao: "concluida" | "em andamento" | "nao iniciada";
      avaliada: boolean;
      acerto: number | null;
      data: string | null;
    }[];
  }>(`/professor/atividades/${encodeURIComponent(id)}/situacao`, { token: await tokenDaApi() }).catch(() => null);
}
