import "server-only";
import { MISSOES, PLANOS_EXEMPLO, type DadosPlano, type PlanoAula, type Professor } from "@modolume/core";
import { chamarApi, usandoApi } from "./api";
import { tokenDaApi } from "./dados";

/**
 * Planejamento de aulas do professor (ADR 0010). O contrato (situações,
 * habilidades, formato do plano e validação) fica no núcleo. Com a API ligada,
 * os planos ficam no banco (tabela plano_aula e as filhas: habilidades,
 * formatos, missões e alunos acompanhados); sem ela (demonstração), ficam na
 * memória do servidor.
 */
export {
  HABILIDADES_BNCC,
  ROTULO_SITUACAO,
  SITUACOES_PLANO,
  UNIDADES_TEMATICAS,
  formatoValido,
  type DadosPlano,
  type PlanoAula,
  type SituacaoPlano,
} from "@modolume/core";

// guardado no objeto global para sobreviver ao recarregamento do servidor de desenvolvimento
const memoria = globalThis as unknown as { __planosModolume?: PlanoAula[] };
const planos = () => {
  const lista = (memoria.__planosModolume ??= structuredClone(PLANOS_EXEMPLO));
  return lista;
};

const porData = (a: PlanoAula, b: PlanoAula) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario);

export async function listarPlanos(professor: Professor, filtro: { turmaId?: string; status?: string } = {}) {
  if (usandoApi()) {
    const q = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v) as [string, string][]);
    return chamarApi<PlanoAula[]>(`/professor/planos${q.size ? `?${q}` : ""}`, { token: await tokenDaApi() });
  }
  return planos()
    .filter((p) => p.professorId === professor.id)
    .filter((p) => !filtro.turmaId || p.turmaId === filtro.turmaId)
    .filter((p) => !filtro.status || p.status === filtro.status)
    .sort(porData);
}

/** Plano do professor; null se não existir ou for de outro professor. */
export async function buscarPlano(professor: Professor, id: string) {
  if (usandoApi())
    return chamarApi<PlanoAula>(`/professor/planos/${encodeURIComponent(id)}`, { token: await tokenDaApi() }).catch(
      () => null,
    );
  return planos().find((p) => p.id === id && p.professorId === professor.id) ?? null;
}

export async function salvarPlano(professor: Professor, dados: DadosPlano, id?: string) {
  if (usandoApi()) {
    const { id: _id, professorId: _p, atualizadoEm: _a, ...corpo } = dados as Partial<PlanoAula> & DadosPlano;
    return chamarApi<PlanoAula>(id ? `/professor/planos/${encodeURIComponent(id)}` : "/professor/planos", {
      token: await tokenDaApi(),
      metodo: id ? "PUT" : "POST",
      corpo,
    });
  }
  const agora = new Date().toISOString().slice(0, 10);
  if (id) {
    const atual = await buscarPlano(professor, id);
    if (!atual) return null;
    Object.assign(atual, dados, { atualizadoEm: agora });
    return atual;
  }
  const novo: PlanoAula = { ...dados, id: `plano-${Date.now()}`, professorId: professor.id, atualizadoEm: agora };
  planos().push(novo);
  return novo;
}

export async function excluirPlano(professor: Professor, id: string) {
  if (usandoApi()) {
    await chamarApi(`/professor/planos/${encodeURIComponent(id)}`, { token: await tokenDaApi(), metodo: "DELETE" });
    return;
  }
  const lista = planos();
  const i = lista.findIndex((p) => p.id === id && p.professorId === professor.id);
  if (i >= 0) lista.splice(i, 1);
}

/** Copia um plano para outra turma e/ou data, como planejado e sem registro. */
export async function duplicarPlano(professor: Professor, id: string, destino: { turmaId: string; data: string }) {
  const original = await buscarPlano(professor, id);
  if (!original) return null;
  const { id: _id, professorId: _p, atualizadoEm: _a, ...dados } = original;
  return salvarPlano(professor, {
    ...dados,
    turmaId: destino.turmaId,
    data: destino.data,
    status: "planejada",
    registro: "",
    // os alunos acompanhados só valem na mesma turma
    alunosFoco: destino.turmaId === original.turmaId ? dados.alunosFoco : [],
  });
}

/** Atividades do app que podem entrar num plano (só o que o formulário precisa). */
export function atividadesDoApp() {
  return MISSOES.map((m) => ({ id: m.id, titulo: m.titulo, formato: m.formato, conteudo: m.conteudo }));
}
