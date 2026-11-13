import "server-only";
import type { Professor } from "@modolume/core";
import { avaliacoesPendentes } from "./avaliacoes";
import { listarAtividades } from "./atividades";
import { listaDeTurmas, visaoGeral } from "./dados";
import { listarPlanos } from "./planejamento";

/**
 * Alertas do dia do professor: o que pede uma ação hoje. Cada alerta leva
 * direto ao lugar onde a ação é feita.
 */
export interface Alerta {
  id: string;
  tipo: "agenda" | "pendencia" | "aluno" | "app";
  titulo: string;
  detalhe: string;
  href: string;
}

const isoDe = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export async function alertasDoDia(professor: Professor): Promise<Alerta[]> {
  const agora = new Date();
  const hoje = isoDe(agora);
  const amanha = isoDe(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1));
  const [planos, atividades, turmas, { atencao }, avaliacoes] = await Promise.all([
    listarPlanos(professor),
    listarAtividades(professor),
    listaDeTurmas(professor),
    visaoGeral(professor),
    avaliacoesPendentes(),
  ]);
  const turma = (id: string) => turmas.find((t) => t.turma.id === id)?.turma.nome ?? "";
  const alertas: Alerta[] = [];

  for (const p of planos.filter((p) => p.data === hoje))
    alertas.push({
      id: `hoje-${p.id}`,
      tipo: "agenda",
      titulo: `Aula hoje${p.horario ? ` às ${p.horario}` : ""} · ${turma(p.turmaId)}`,
      detalhe: p.tema,
      href: `/professor?plano=${p.id}`,
    });
  for (const p of planos.filter((p) => p.data === amanha && (p.status === "rascunho" || !p.objetivos)))
    alertas.push({
      id: `amanha-${p.id}`,
      tipo: "pendencia",
      titulo: "Plano de amanhã ainda em rascunho",
      detalhe: `${turma(p.turmaId)} · ${p.tema}`,
      href: `/professor/planejamento/${p.id}/editar`,
    });
  const semRegistro = planos.filter((p) => p.data < hoje && p.status !== "realizada");
  for (const p of semRegistro.slice(-3))
    alertas.push({
      id: `registro-${p.id}`,
      tipo: "pendencia",
      titulo: "Aula sem registro",
      detalhe: `${p.data.split("-").reverse().slice(0, 2).join("/")} · ${turma(p.turmaId)} · ${p.tema}`,
      href: `/professor/planejamento/${p.id}`,
    });
  for (const a of atividades.filter((a) => a.status === "enviada" && a.liberarEm === hoje))
    alertas.push({
      id: `app-${a.id}`,
      tipo: "app",
      titulo: "Atividade liberada hoje no app",
      detalhe: `${a.titulo} · ${a.turmas.map(turma).join(", ")}`,
      href: `/professor/atividades/${a.id}`,
    });
  for (const a of atividades.filter((a) => a.status === "rascunho" && a.liberarEm <= hoje))
    alertas.push({
      id: `rascunho-${a.id}`,
      tipo: "app",
      titulo: "Atividade com data passada e ainda não enviada",
      detalhe: a.titulo,
      href: `/professor/atividades/${a.id}`,
    });
  const caindo = atencao.filter((a) => a.tendencia <= -10);
  for (const a of caindo)
    alertas.push({
      id: `queda-${a.alunoId}`,
      tipo: "aluno",
      titulo: `${a.nome} caiu ${Math.abs(a.tendencia)} pontos`,
      detalhe: `${turma(a.turmaId)} · acerto médio ${Math.round(a.acertoMedio)}%`,
      href: `/professor/alunos/${a.alunoId}`,
    });
  if (atencao.length > 0)
    alertas.push({
      id: `atencao-${atencao.length}`,
      tipo: "aluno",
      titulo: `${atencao.length} ${atencao.length === 1 ? "aluno pede" : "alunos pedem"} atenção`,
      detalhe: "Abaixo de 60% de acerto ou em queda no período",
      href: "/professor/alunos?situacao=atencao",
    });
  for (const a of avaliacoes)
    alertas.push({
      id: `avaliacao-${a.id}-${a.quantidade}`,
      tipo: "pendencia",
      titulo: `${a.quantidade} ${a.quantidade === 1 ? "avaliação pendente" : "avaliações pendentes"}`,
      detalhe: a.titulo,
      href: `/professor/atividades/${a.id}`,
    });
  return alertas;
}
