"use server";

import { revalidatePath } from "next/cache";
import { acao, type ResultadoAcao } from "@/lib/escola/api";

/**
 * Ações do administrador. Cada uma só repassa o pedido à API, que confere o
 * papel (administrador), a escola e as regras (ex.: não desativar a si mesmo).
 */

const txt = (f: FormData, nome: string) => String(f.get(nome) ?? "").trim();

function resultado(r: Awaited<ReturnType<typeof acao>>, mensagem: string, caminhos: string[]): ResultadoAcao {
  if (!r.ok) return { ok: false, erro: r.erro };
  caminhos.forEach((c) => revalidatePath(c));
  return {
    ok: true,
    mensagem,
    senha: typeof r.dados.senhaProvisoria === "string" ? r.dados.senhaProvisoria : undefined,
    codigo: typeof r.dados.codigoAcesso === "string" ? r.dados.codigoAcesso : undefined,
  };
}

const dadosPessoa = (f: FormData) => ({
  nome: txt(f, "nome"),
  email: txt(f, "email"),
  papel: txt(f, "papel"),
  disciplina: txt(f, "disciplina") || null,
});

export async function criarUsuario(_: ResultadoAcao | null, f: FormData) {
  const r = await acao("/admin/usuarios", { metodo: "POST", corpo: dadosPessoa(f) });
  return resultado(r, "Pessoa cadastrada. Repasse a senha provisória: ela aparece só agora.", [
    "/admin/usuarios",
    "/admin",
  ]);
}

export async function editarUsuario(id: string, _: ResultadoAcao | null, f: FormData) {
  const r = await acao(`/admin/usuarios/${encodeURIComponent(id)}`, { metodo: "PUT", corpo: dadosPessoa(f) });
  return resultado(r, "Dados salvos.", ["/admin/usuarios", `/admin/usuarios/${id}`]);
}

export async function alternarUsuario(id: string, ativo: boolean, _: ResultadoAcao | null) {
  const r = await acao(`/admin/usuarios/${encodeURIComponent(id)}/ativo`, { metodo: "POST", corpo: { ativo } });
  return resultado(r, ativo ? "Acesso reativado." : "Acesso desativado. A pessoa saiu do painel.", [
    "/admin/usuarios",
    `/admin/usuarios/${id}`,
  ]);
}

export async function novaSenhaUsuario(id: string, _: ResultadoAcao | null) {
  const r = await acao(`/admin/usuarios/${encodeURIComponent(id)}/nova-senha`, { metodo: "POST" });
  return resultado(r, "Senha provisória criada. Repasse à pessoa: ela aparece só agora.", [`/admin/usuarios/${id}`]);
}

const dadosTurma = (f: FormData) => ({
  nome: txt(f, "nome"),
  serie: txt(f, "serie"),
  periodo: txt(f, "periodo"),
  anoLetivo: Number(txt(f, "anoLetivo")),
});

export async function criarTurma(_: ResultadoAcao | null, f: FormData) {
  const r = await acao("/admin/turmas", { metodo: "POST", corpo: dadosTurma(f) });
  return resultado(r, "Turma criada. A coordenação já pode vincular os professores.", ["/admin/turmas", "/admin"]);
}

export async function editarTurma(id: string, _: ResultadoAcao | null, f: FormData) {
  const r = await acao(`/admin/turmas/${encodeURIComponent(id)}`, { metodo: "PUT", corpo: dadosTurma(f) });
  return resultado(r, "Turma salva.", ["/admin/turmas", `/admin/turmas/${id}`]);
}

export async function alternarTurma(id: string, ativa: boolean, _: ResultadoAcao | null) {
  const r = await acao(`/admin/turmas/${encodeURIComponent(id)}/ativa`, { metodo: "POST", corpo: { ativa } });
  return resultado(r, ativa ? "Turma reaberta." : "Turma encerrada.", ["/admin/turmas", `/admin/turmas/${id}`]);
}

const dadosAluno = (f: FormData) => ({
  nome: txt(f, "nome"),
  matricula: txt(f, "matricula"),
  turmaId: txt(f, "turmaId"),
});

export async function criarAluno(_: ResultadoAcao | null, f: FormData) {
  const turmaId = txt(f, "turmaId");
  const r = await acao("/admin/alunos", { metodo: "POST", corpo: dadosAluno(f) });
  return resultado(r, "Aluno cadastrado. Entregue o código de acesso ao aluno.", [
    `/admin/turmas/${turmaId}`,
    "/admin/turmas",
  ]);
}

export async function editarAluno(id: string, turmaAtual: string, _: ResultadoAcao | null, f: FormData) {
  const r = await acao(`/admin/alunos/${encodeURIComponent(id)}`, { metodo: "PUT", corpo: dadosAluno(f) });
  return resultado(r, "Aluno salvo.", [`/admin/turmas/${turmaAtual}`, `/admin/turmas/${txt(f, "turmaId")}`]);
}

export async function alternarAluno(id: string, turmaId: string, ativo: boolean, _: ResultadoAcao | null) {
  const r = await acao(`/admin/alunos/${encodeURIComponent(id)}/ativo`, { metodo: "POST", corpo: { ativo } });
  return resultado(r, ativo ? "Aluno reativado." : "Aluno desativado. Ele saiu do app.", [`/admin/turmas/${turmaId}`]);
}
