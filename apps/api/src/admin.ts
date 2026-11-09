import { randomInt, randomUUID } from "node:crypto";
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { numeroDaPagina } from "@modolume/core";
import { configuracaoRecuperacao, gerarSegredo } from "./credencial.js";
import { ALFABETO_CODIGO_TURMA, gerarCodigoAcesso } from "./codigo-acesso.js";
import { Banco, EquipeAtual, GuardaAdmin, registrar, validar, type Equipe } from "./infra.js";

/**
 * Área do administrador (PRD-02): cadastra e gerencia a equipe da escola e os
 * papéis (permissões), as turmas e os alunos, e consulta o registro de
 * atividades. Tudo recortado pela instituição do administrador.
 *
 * Proteções: o administrador não desativa nem rebaixa a si mesmo, e a escola
 * nunca fica sem um administrador ativo. Senhas criadas aqui são provisórias:
 * a pessoa troca no primeiro acesso.
 */

const PAPEIS = ["professor", "coordenacao", "admin"] as const;
const NOME_PAPEL: Record<(typeof PAPEIS)[number], string> = {
  professor: "Professor",
  coordenacao: "Coordenação",
  admin: "Administrador",
};
const PERIODOS = { manhã: "manha", tarde: "tarde", integral: "integral" } as const;
const periodoTexto = (p: "manha" | "tarde" | "integral") => (p === "manha" ? "manhã" : p);

const textoCurto = (max: number, rotulo: string) =>
  z
    .string()
    .trim()
    .min(2, `Informe ${rotulo}.`)
    .max(max, `${rotulo[0]!.toUpperCase()}${rotulo.slice(1)} muito longo.`);

const dadosUsuario = z
  .object({
    nome: textoCurto(120, "o nome"),
    email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(160),
    papel: z.enum(PAPEIS, { errorMap: () => ({ message: "Escolha o papel." }) }),
    disciplina: z.string().trim().max(60).optional().nullable(),
  })
  .refine((d) => d.papel !== "professor" || (d.disciplina ?? "").length >= 2, {
    message: "Informe a disciplina do professor.",
    path: ["disciplina"],
  });
const ativo = z.object({ ativo: z.boolean() });

const dadosTurma = z.object({
  nome: textoCurto(60, "o nome da turma"),
  serie: textoCurto(30, "a série"),
  periodo: z.enum(["manhã", "tarde", "integral"], { errorMap: () => ({ message: "Escolha o período." }) }),
  anoLetivo: z.coerce.number().int().min(2000).max(2100),
});
const ativa = z.object({ ativa: z.boolean() });

const dadosAluno = z.object({
  nome: textoCurto(120, "o nome do aluno"),
  matricula: z.string().trim().min(1, "Informe a matrícula.").max(30, "Matrícula muito longa."),
  turmaId: z.string().min(1, "Escolha a turma.").max(40),
});

@Controller("admin")
@UseGuards(GuardaAdmin)
export class ControladorAdministracao {
  constructor(@Inject(Banco) private readonly banco: Banco) {}

  // ─────────────────────────── visão geral ───────────────────────────

  @Get("resumo")
  async resumo(@EquipeAtual() eu: Equipe) {
    const inst = eu.instituicaoId;
    const [instituicao, equipe, turmas, alunos, registros] = await Promise.all([
      this.banco.instituicao.findUniqueOrThrow({ where: { id: inst } }),
      this.banco.professor.groupBy({ by: ["papel", "ativo"], where: { instituicaoId: inst }, _count: true }),
      this.banco.turma.count({ where: { instituicaoId: inst, ativa: true } }),
      this.banco.aluno.count({ where: { turma: { instituicaoId: inst }, ativo: true } }),
      this.banco.registro.findMany({ where: { instituicaoId: inst }, orderBy: { criadoEm: "desc" }, take: 8 }),
    ]);
    const conta = (papel: string) =>
      equipe.filter((e) => e.papel === papel && e.ativo).reduce((s, e) => s + e._count, 0);
    return {
      instituicao: { id: instituicao.id, nome: instituicao.nome },
      professores: conta("professor"),
      coordenacao: conta("coordenacao"),
      administradores: conta("admin"),
      desativados: equipe.filter((e) => !e.ativo).reduce((s, e) => s + e._count, 0),
      turmas,
      alunos,
      registrosRecentes: registros.map(registroParaTela),
    };
  }

  // ─────────────────────────── usuários (equipe) ───────────────────────────

  @Get("usuarios")
  async usuarios(@EquipeAtual() eu: Equipe) {
    const pessoas = await this.banco.professor.findMany({
      where: { instituicaoId: eu.instituicaoId },
      orderBy: [{ ativo: "desc" }, { nome: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        disciplina: true,
        ativo: true,
        senhaProvisoria: true,
        ultimoAcesso: true,
        criadoEm: true,
        turmas: { include: { turma: { select: { id: true, nome: true, ativa: true } } } },
      },
    });
    return pessoas.map((p) => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      papel: p.papel,
      disciplina: p.disciplina,
      ativo: p.ativo,
      senhaProvisoria: p.senhaProvisoria,
      ultimoAcesso: p.ultimoAcesso,
      criadoEm: p.criadoEm,
      turmas: p.turmas.filter((v) => v.turma.ativa).map((v) => ({ id: v.turma.id, nome: v.turma.nome })),
      eu: p.id === eu.id,
    }));
  }

  @Post("usuarios")
  async criarUsuario(@EquipeAtual() eu: Equipe, @Body() corpo: unknown) {
    const d = validar(dadosUsuario, corpo);
    if (await this.banco.professor.findUnique({ where: { email: d.email } }))
      throw new ConflictException("Já existe uma pessoa com esse e-mail.");
    const senha = gerarSegredo();
    const senhaHash = await bcrypt.hash(senha, 12);
    return this.banco.$transaction(async (transacao) => {
      const nova = await transacao.professor.create({
        data: {
          id: randomUUID(),
          instituicaoId: eu.instituicaoId,
          nome: d.nome,
          email: d.email,
          papel: d.papel,
          disciplina: d.papel === "professor" ? d.disciplina! : (d.disciplina ?? null) || null,
          senhaHash,
          senhaProvisoria: true,
        },
      });
      await registrar(transacao, eu, "usuario.criado", {
        tipo: "usuario",
        id: nova.id,
        detalhe: `${nova.nome} (${NOME_PAPEL[nova.papel]})`,
      });
      return { id: nova.id };
    });
  }

  @Put("usuarios/:id")
  async editarUsuario(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const d = validar(dadosUsuario, corpo);
    const atual = await this.pessoaDaEscola(eu, id);
    const alterouEmail = atual.email !== d.email;
    if (alterouEmail && !atual.senhaProvisoria)
      throw new BadRequestException(
        "O e-mail de uma conta com senha definida não pode ser alterado pela administração.",
      );
    if (id === eu.id && d.papel !== "admin")
      throw new BadRequestException("Você não pode tirar o seu próprio papel de administrador.");
    if (atual.papel === "admin" && d.papel !== "admin") await this.garantirOutroAdmin(eu, id);
    const outro = await this.banco.professor.findUnique({ where: { email: d.email } });
    if (outro && outro.id !== id) throw new ConflictException("Já existe uma pessoa com esse e-mail.");

    const mudancas: string[] = [];
    if (atual.papel !== d.papel) mudancas.push(`papel: ${NOME_PAPEL[atual.papel]} → ${NOME_PAPEL[d.papel]}`);
    if (atual.email !== d.email) mudancas.push("e-mail alterado");
    if (atual.nome !== d.nome) mudancas.push("nome alterado");
    await this.banco.$transaction(async (tx) => {
      await tx.professor.update({
        where: { id, ...(alterouEmail ? { senhaProvisoria: true, email: atual.email } : {}) },
        data: {
          nome: d.nome,
          ...(alterouEmail ? { email: d.email } : {}),
          papel: d.papel,
          disciplina: d.papel === "professor" ? d.disciplina! : (d.disciplina ?? null) || null,
          ...(atual.papel !== d.papel || atual.email !== d.email
            ? { versaoAcesso: { increment: 1 }, redefinicaoHash: null, redefinicaoExpiraEm: null }
            : {}),
        },
      });
      // Papel e vínculos mudam juntos; atividades, planos e histórico são preservados.
      if (atual.papel === "professor" && d.papel !== "professor")
        await tx.professorTurma.deleteMany({ where: { professorId: id } });
      await registrar(tx, eu, atual.papel !== d.papel ? "usuario.papel" : "usuario.editado", {
        tipo: "usuario",
        id,
        detalhe: `${d.nome}${mudancas.length ? `: ${mudancas.join(", ")}` : ""}`,
      });
    });
    return { ok: true };
  }

  @Post("usuarios/:id/ativo")
  async ativarUsuario(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const { ativo: valor } = validar(ativo, corpo);
    const pessoa = await this.pessoaDaEscola(eu, id);
    if (!valor && id === eu.id) throw new BadRequestException("Você não pode desativar a sua própria conta.");
    if (!valor && pessoa.papel === "admin") await this.garantirOutroAdmin(eu, id);
    await this.banco.$transaction(async (transacao) => {
      await transacao.professor.update({
        where: { id },
        data: { ativo: valor, versaoAcesso: { increment: 1 }, redefinicaoHash: null, redefinicaoExpiraEm: null },
      });
      await registrar(transacao, eu, valor ? "usuario.ativado" : "usuario.desativado", {
        tipo: "usuario",
        id,
        detalhe: pessoa.nome,
      });
    });
    return { ok: true };
  }

  @Post("usuarios/:id/nova-senha")
  async novaSenha(@EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const pessoa = await this.pessoaDaEscola(eu, id);
    if (id === eu.id) throw new BadRequestException("Para alterar sua senha, use a área da conta.");
    configuracaoRecuperacao(); // Sem envio configurado, a pessoa não teria como recuperar o acesso.
    const senha = gerarSegredo();
    const senhaHash = await bcrypt.hash(senha, 12);
    await this.banco.$transaction(async (transacao) => {
      await transacao.professor.update({
        where: { id },
        data: {
          senhaHash,
          versaoAcesso: { increment: 1 },
          redefinicaoHash: null,
          redefinicaoExpiraEm: null,
        },
      });
      await registrar(transacao, eu, "usuario.senha_redefinida", { tipo: "usuario", id, detalhe: pessoa.nome });
    });
    return { ok: true };
  }

  // ─────────────────────────── turmas ───────────────────────────

  @Get("turmas")
  async turmas(@EquipeAtual() eu: Equipe) {
    const turmas = await this.banco.turma.findMany({
      where: { instituicaoId: eu.instituicaoId },
      orderBy: [{ ativa: "desc" }, { anoLetivo: "desc" }, { nome: "asc" }],
      include: {
        professores: { include: { professor: { select: { id: true, nome: true, ativo: true } } } },
        _count: { select: { alunos: { where: { ativo: true } } } },
      },
    });
    return turmas.map((t) => ({
      id: t.id,
      nome: t.nome,
      serie: t.serie,
      periodo: periodoTexto(t.periodo),
      anoLetivo: t.anoLetivo,
      ativa: t.ativa,
      alunos: t._count.alunos,
      professores: t.professores
        .filter((v) => v.professor.ativo)
        .map((v) => ({ id: v.professor.id, nome: v.professor.nome })),
    }));
  }

  @Post("turmas")
  async criarTurma(@EquipeAtual() eu: Equipe, @Body() corpo: unknown) {
    const d = validar(dadosTurma, corpo);
    return this.banco.$transaction(async (transacao) => {
      const turma = await transacao.turma.create({
        data: {
          id: randomUUID(),
          instituicaoId: eu.instituicaoId,
          nome: d.nome,
          serie: d.serie,
          periodo: PERIODOS[d.periodo],
          anoLetivo: d.anoLetivo,
          codigo: await this.codigoDeTurmaLivre(),
        },
      });
      await registrar(transacao, eu, "turma.criada", { tipo: "turma", id: turma.id, detalhe: turma.nome });
      return { id: turma.id };
    });
  }

  @Put("turmas/:id")
  async editarTurma(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const d = validar(dadosTurma, corpo);
    await this.turmaDaEscola(eu, id);
    await this.banco.$transaction(async (transacao) => {
      await transacao.turma.update({
        where: { id },
        data: { nome: d.nome, serie: d.serie, periodo: PERIODOS[d.periodo], anoLetivo: d.anoLetivo },
      });
      await registrar(transacao, eu, "turma.editada", { tipo: "turma", id, detalhe: d.nome });
    });
    return { ok: true };
  }

  @Post("turmas/:id/ativa")
  async ativarTurma(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const { ativa: valor } = validar(ativa, corpo);
    const turma = await this.turmaDaEscola(eu, id);
    await this.banco.$transaction(async (transacao) => {
      await transacao.turma.update({ where: { id }, data: { ativa: valor } });
      // Encerramento e revogação juntos: reabrir não restaura sessões anteriores.
      if (!valor)
        await transacao.aluno.updateMany({ where: { turmaId: id }, data: { versaoAcesso: { increment: 1 } } });
      await registrar(transacao, eu, valor ? "turma.reaberta" : "turma.encerrada", {
        tipo: "turma",
        id,
        detalhe: turma.nome,
      });
    });
    return { ok: true };
  }

  // ─────────────────────────── alunos ───────────────────────────

  @Get("alunos")
  async alunos(@EquipeAtual() eu: Equipe, @Query("turmaId") turmaId?: string) {
    const alunos = await this.banco.aluno.findMany({
      where: { turma: { instituicaoId: eu.instituicaoId }, ...(turmaId ? { turmaId } : {}) },
      orderBy: [{ ativo: "desc" }, { nome: "asc" }],
      include: { turma: { select: { id: true, nome: true } } },
    });
    return alunos.map((a) => ({
      id: a.id,
      nome: a.nome,
      matricula: a.matricula,
      turma: a.turma,
      ativo: a.ativo,
      codigoAcesso: a.codigoAcesso,
      pinCriado: a.pinHash !== null,
      ultimoAcesso: a.ultimoAcesso,
    }));
  }

  @Post("alunos")
  async criarAluno(@EquipeAtual() eu: Equipe, @Body() corpo: unknown) {
    const d = validar(dadosAluno, corpo);
    const turma = await this.turmaDaEscola(eu, d.turmaId);
    if (!turma.ativa) throw new BadRequestException("Não é possível cadastrar alunos em uma turma encerrada.");
    if (await this.banco.aluno.findFirst({ where: { turmaId: d.turmaId, matricula: d.matricula } }))
      throw new ConflictException("Já existe um aluno com essa matrícula nesta turma.");
    return this.banco.$transaction(async (transacao) => {
      const aluno = await transacao.aluno.create({
        data: {
          id: randomUUID(),
          turmaId: d.turmaId,
          nome: d.nome,
          matricula: d.matricula,
          codigoAcesso: await this.codigoDeAlunoLivre(),
        },
      });
      await registrar(transacao, eu, "aluno.criado", {
        tipo: "aluno",
        id: aluno.id,
        detalhe: `${aluno.nome} · ${turma.nome}`,
      });
      return { id: aluno.id, codigoAcesso: aluno.codigoAcesso };
    });
  }

  @Put("alunos/:id")
  async editarAluno(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const d = validar(dadosAluno, corpo);
    const atual = await this.alunoDaEscola(eu, id);
    const destino = await this.turmaDaEscola(eu, d.turmaId);
    const trocou = atual.turmaId !== d.turmaId;
    if (trocou && !destino.ativa)
      throw new BadRequestException("Não é possível transferir alunos para uma turma encerrada.");
    const repetido = await this.banco.aluno.findFirst({
      where: { turmaId: d.turmaId, matricula: d.matricula, NOT: { id } },
    });
    if (repetido) throw new ConflictException("Já existe um aluno com essa matrícula nesta turma.");
    await this.banco.$transaction(async (transacao) => {
      await transacao.aluno.update({
        where: { id },
        data: {
          nome: d.nome,
          matricula: d.matricula,
          turmaId: d.turmaId,
          // Mesma gravação da transferência: nenhum token da turma anterior continua válido.
          ...(trocou ? { versaoAcesso: { increment: 1 } } : {}),
        },
      });
      // as jogadas ficam ligadas ao aluno: trocar de turma preserva o histórico (RN-18)
      await registrar(transacao, eu, trocou ? "aluno.trocou_turma" : "aluno.editado", {
        tipo: "aluno",
        id,
        detalhe: trocou ? `${d.nome} → ${destino.nome}` : d.nome,
      });
    });
    return { ok: true };
  }

  @Post("alunos/:id/ativo")
  async ativarAluno(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const { ativo: valor } = validar(ativo, corpo);
    const aluno = await this.alunoDaEscola(eu, id);
    // desativar encerra as sessões do aluno no app (a guarda confere "ativo")
    await this.banco.$transaction(async (transacao) => {
      await transacao.aluno.update({ where: { id }, data: { ativo: valor, versaoAcesso: { increment: 1 } } });
      await registrar(transacao, eu, valor ? "aluno.ativado" : "aluno.desativado", {
        tipo: "aluno",
        id,
        detalhe: aluno.nome,
      });
    });
    return { ok: true };
  }

  // ─────────────────────────── registro de atividades ───────────────────────────

  @Get("registros")
  async registros(
    @EquipeAtual() eu: Equipe,
    @Query("acao") acao?: string,
    @Query("usuarioId") usuarioId?: string,
    @Query("pagina") pagina = "1",
  ) {
    const POR_PAGINA = 50;
    const n = numeroDaPagina(pagina);
    const where = {
      instituicaoId: eu.instituicaoId,
      // filtro por grupo: "usuario" pega usuario.criado, usuario.papel...
      ...(acao ? { acao: { startsWith: acao.slice(0, 40) } } : {}),
      ...(usuarioId ? { usuarioId: usuarioId.slice(0, 40) } : {}),
    };
    const [total, linhas] = await Promise.all([
      this.banco.registro.count({ where }),
      this.banco.registro.findMany({
        where,
        orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
        skip: (n - 1) * POR_PAGINA,
        take: POR_PAGINA,
      }),
    ]);
    return { total, pagina: n, porPagina: POR_PAGINA, registros: linhas.map(registroParaTela) };
  }

  // ─────────────────────────── apoio ───────────────────────────

  private async pessoaDaEscola(eu: Equipe, id: string) {
    const p = await this.banco.professor.findFirst({ where: { id, instituicaoId: eu.instituicaoId } });
    if (!p) throw new NotFoundException("Pessoa não encontrada.");
    return p;
  }

  private async turmaDaEscola(eu: Equipe, id: string) {
    const t = await this.banco.turma.findFirst({ where: { id, instituicaoId: eu.instituicaoId } });
    if (!t) throw new NotFoundException("Turma não encontrada.");
    return t;
  }

  private async alunoDaEscola(eu: Equipe, id: string) {
    const a = await this.banco.aluno.findFirst({ where: { id, turma: { instituicaoId: eu.instituicaoId } } });
    if (!a) throw new NotFoundException("Aluno não encontrado.");
    return a;
  }

  /** A escola precisa continuar com pelo menos um administrador ativo além de `id`. */
  private async garantirOutroAdmin(eu: Equipe, id: string) {
    const outros = await this.banco.professor.count({
      where: { instituicaoId: eu.instituicaoId, papel: "admin", ativo: true, NOT: { id } },
    });
    if (outros === 0) throw new BadRequestException("A escola precisa de pelo menos um administrador ativo.");
  }

  private async codigoDeTurmaLivre() {
    for (;;) {
      let c = "";
      for (let i = 0; i < 6; i++) c += ALFABETO_CODIGO_TURMA[randomInt(ALFABETO_CODIGO_TURMA.length)];
      if (!(await this.banco.turma.findUnique({ where: { codigo: c } }))) return c;
    }
  }

  private async codigoDeAlunoLivre() {
    for (;;) {
      const c = gerarCodigoAcesso();
      if (!(await this.banco.aluno.findUnique({ where: { codigoAcesso: c } }))) return c;
    }
  }
}

export function registroParaTela(r: {
  id: bigint;
  usuarioId: string | null;
  usuarioNome: string | null;
  papel: string | null;
  acao: string;
  alvoTipo: string | null;
  alvoId: string | null;
  detalhe: string | null;
  criadoEm: Date;
}) {
  return {
    id: r.id.toString(),
    usuarioId: r.usuarioId,
    usuarioNome: r.usuarioNome,
    papel: r.papel,
    acao: r.acao,
    alvoTipo: r.alvoTipo,
    alvoId: r.alvoId,
    detalhe: r.detalhe,
    criadoEm: r.criadoEm,
  };
}
