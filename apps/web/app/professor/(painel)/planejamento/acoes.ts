"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MISSOES } from "@modolume/core";
import { listaDeTurmas, professorLogado } from "@/lib/painel/dados";
import {
  STATUS_PLANO,
  buscarPlano,
  duplicarPlano,
  excluirPlano,
  formatoValido,
  salvarPlano,
  type DadosPlano,
  type StatusPlano,
} from "@/lib/painel/planejamento";

export interface EstadoPlano {
  erros: Partial<Record<"turmaId" | "data" | "tema" | "objetivos" | "aulas", string>>;
  /** O que foi enviado, para o formulário não perder o que o professor digitou. */
  valores?: DadosPlano;
  /** Muda a cada envio com erro, para o formulário remontar com os valores enviados. */
  tentativa: number;
}

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? "").trim();

/** Cria ou atualiza um plano de aula. O id vem num campo oculto quando é edição. */
export async function gravarPlano(anterior: EstadoPlano, form: FormData): Promise<EstadoPlano> {
  const professor = await professorLogado();
  const turmas = await listaDeTurmas(professor);
  const id = texto(form, "id") || undefined;

  const turmaId = texto(form, "turmaId");
  const aulas = Number(texto(form, "aulas") || "1");
  const status = texto(form, "status") as StatusPlano;
  const dados: DadosPlano = {
    turmaId,
    data: texto(form, "data"),
    horario: texto(form, "horario"),
    aulas,
    tema: texto(form, "tema"),
    unidade: texto(form, "unidade"),
    habilidades: form.getAll("habilidades").map(String),
    objetivos: texto(form, "objetivos"),
    conteudos: texto(form, "conteudos"),
    metodologia: texto(form, "metodologia"),
    formatos: form.getAll("formatos").map(String).filter(formatoValido),
    atividadesApp: form
      .getAll("atividadesApp")
      .map(String)
      .filter((a) => MISSOES.some((m) => m.id === a)),
    recursos: texto(form, "recursos"),
    avaliacao: texto(form, "avaliacao"),
    // só alunos da turma escolhida
    alunosFoco: form
      .getAll("alunosFoco")
      .map(String)
      .filter((a) => a.startsWith(`${turmaId}-`)),
    observacoes: texto(form, "observacoes"),
    status: STATUS_PLANO.includes(status) ? status : "rascunho",
    registro: texto(form, "registro"),
  };

  const erros: EstadoPlano["erros"] = {};
  if (!turmas.some((t) => t.turma.id === turmaId)) erros.turmaId = "Escolha a turma.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) erros.data = "Informe a data da aula.";
  if (!dados.tema) erros.tema = "Dê um tema para a aula.";
  if (!dados.objetivos && dados.status !== "rascunho")
    erros.objetivos = "Descreva os objetivos (só rascunhos podem ficar sem).";
  if (!Number.isInteger(aulas) || aulas < 1 || aulas > 10) erros.aulas = "Entre 1 e 10 aulas.";
  if (Object.keys(erros).length > 0) return { erros, valores: dados, tentativa: anterior.tentativa + 1 };

  const plano = await salvarPlano(professor, dados, id);
  if (!plano) redirect("/professor/planejamento");
  revalidatePath("/professor", "layout");
  redirect(`/professor/planejamento/${plano.id}`);
}

export async function mudarStatus(id: string, status: StatusPlano) {
  const professor = await professorLogado();
  const plano = await buscarPlano(professor, id);
  if (plano && STATUS_PLANO.includes(status)) {
    await salvarPlano(professor, { ...plano, status }, id);
    revalidatePath("/professor", "layout");
  }
}

export async function apagarPlano(id: string) {
  const professor = await professorLogado();
  await excluirPlano(professor, id);
  revalidatePath("/professor", "layout");
  redirect("/professor/planejamento");
}

/** Registro rápido depois da aula: guarda o que aconteceu e marca como realizada. */
export async function registrarAula(id: string, form: FormData) {
  const professor = await professorLogado();
  const plano = await buscarPlano(professor, id);
  const registro = texto(form, "registro");
  if (plano && registro) {
    await salvarPlano(professor, { ...plano, registro, status: "realizada" }, id);
    revalidatePath("/professor", "layout");
  }
}

/** Duplica o plano para a turma e a data escolhidas e abre a cópia. */
export async function duplicar(id: string, form: FormData) {
  const professor = await professorLogado();
  const turmas = await listaDeTurmas(professor);
  const turmaId = texto(form, "turmaId");
  const data = texto(form, "data");
  if (!turmas.some((t) => t.turma.id === turmaId) || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return;
  const copia = await duplicarPlano(professor, id, { turmaId, data });
  if (!copia) return;
  revalidatePath("/professor", "layout");
  redirect(`/professor/planejamento/${copia.id}`);
}
