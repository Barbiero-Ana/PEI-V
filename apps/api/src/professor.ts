import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { STATUS_PLANO, atividadeSchema, planoSchema, type DadosAtividade, type DadosPlano } from "@modolume/core";
import { z } from "zod";
import {
  atividadeDoBanco,
  dataDoBanco,
  dataIso,
  incluirAtividade,
  incluirPlano,
  planoDoBanco,
  questoesParaBanco,
} from "./conversao.js";
import { gerarCodigoAcesso } from "./codigo-acesso.js";
import {
  Banco,
  EquipeAtual,
  GuardaProfessor,
  SessaoAtual,
  registrar,
  validar,
  type Equipe,
  type Sessao,
} from "./infra.js";

const envio = z.object({ enviar: z.boolean() });
const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const periodoTexto = (p: "manha" | "tarde" | "integral") => (p === "manha" ? "manhã" : p);

/**
 * O que o painel do professor usa. Toda consulta é recortada pelas turmas
 * vinculadas ao professor da sessão (tabela professor_turma): um professor
 * nunca vê nem altera dados de turmas de outro (MOD-TUR-009, MOD-SEG-003).
 */
@Controller("professor")
@UseGuards(GuardaProfessor)
export class ProfessorController {
  constructor(@Inject(Banco) private readonly banco: Banco) {}

  private async idsDasTurmas(professorId: string) {
    const vinculos = await this.banco.professorTurma.findMany({
      where: { professorId, turma: { ativa: true } },
      select: { turmaId: true },
    });
    return vinculos.map((v) => v.turmaId);
  }

  private async conferirTurmas(professorId: string, turmas: string[]) {
    const minhas = new Set(await this.idsDasTurmas(professorId));
    if (turmas.some((t) => !minhas.has(t))) throw new ForbiddenException("Turma que não é sua.");
  }

  /** Habilidades e planos referenciados precisam existir (e o plano ser do professor). */
  private async conferirReferencias(professorId: string, habilidades: string[], planoId?: string) {
    if (habilidades.length) {
      const existem = await this.banco.habilidadeBncc.count({ where: { codigo: { in: habilidades } } });
      if (existem !== new Set(habilidades).size) throw new BadRequestException("Habilidade da BNCC não cadastrada.");
    }
    if (planoId && !(await this.banco.planoAula.findFirst({ where: { id: planoId, professorId } })))
      throw new BadRequestException("Plano de aula não encontrado.");
  }

  /** Aluno de uma das turmas do professor, ou 404 (não revela alunos de outras turmas). */
  private async meuAluno(professorId: string, alunoId: string) {
    const ids = await this.idsDasTurmas(professorId);
    const aluno = await this.banco.aluno.findFirst({ where: { id: alunoId, turmaId: { in: ids } } });
    if (!aluno) throw new NotFoundException("Aluno não encontrado.");
    return aluno;
  }

  /** Zera o PIN (o aluno esqueceu): no próximo acesso, ele cria um novo. Também tira o bloqueio. */
  @Post("alunos/:id/zerar-pin")
  async zerarPin(@SessaoAtual() s: Sessao, @EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const aluno = await this.meuAluno(s.sub, id);
    await this.banco.aluno.update({
      where: { id: aluno.id },
      data: { pinHash: null, pinFalhas: 0, bloqueadoAte: null },
    });
    await registrar(this.banco, eu, "aluno.pin_zerado", { tipo: "aluno", id: aluno.id, detalhe: aluno.nome });
    return { ok: true };
  }

  /**
   * Gera um código novo (código vazou, celular perdido): o antigo para de
   * funcionar e o aluno sai do app em todos os aparelhos. O PIN continua o mesmo.
   */
  @Post("alunos/:id/novo-codigo")
  async novoCodigo(@SessaoAtual() s: Sessao, @EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const aluno = await this.meuAluno(s.sub, id);
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const codigoAcesso = gerarCodigoAcesso();
      if (await this.banco.aluno.findUnique({ where: { codigoAcesso } })) continue;
      await this.banco.aluno.update({
        where: { id: aluno.id },
        data: { codigoAcesso, versaoAcesso: { increment: 1 }, pinFalhas: 0, bloqueadoAte: null },
      });
      await registrar(this.banco, eu, "aluno.novo_codigo", { tipo: "aluno", id: aluno.id, detalhe: aluno.nome });
      return { codigoAcesso };
    }
    throw new BadRequestException("Não deu para gerar o código agora. Tente de novo.");
  }

  /**
   * Tudo o que o painel precisa para calcular os indicadores com o núcleo:
   * escola, turmas, alunos (com o avatar do app) e as jogadas das turmas.
   */
  @Get("dados")
  async dados(@SessaoAtual() s: Sessao) {
    const professor = await this.banco.professor.findUniqueOrThrow({
      where: { id: s.sub },
      include: { instituicao: true },
    });
    const ids = await this.idsDasTurmas(s.sub);
    const [turmas, alunos, jogadas] = await Promise.all([
      this.banco.turma.findMany({ where: { id: { in: ids } }, orderBy: { nome: "asc" } }),
      this.banco.aluno.findMany({
        where: { turmaId: { in: ids }, ativo: true },
        orderBy: { nome: "asc" },
        include: { avatar: { select: { svg: true } } },
      }),
      this.banco.jogada.findMany({
        where: { aluno: { turmaId: { in: ids } } },
        orderBy: { data: "asc" },
      }),
    ]);
    return {
      instituicao: { id: professor.instituicao.id, nome: professor.instituicao.nome },
      professor: {
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
        disciplina: professor.disciplina ?? "",
        instituicaoId: professor.instituicaoId,
      },
      turmas: turmas.map((t) => ({
        id: t.id,
        professorId: s.sub,
        nome: t.nome,
        serie: t.serie,
        periodo: periodoTexto(t.periodo),
        codigo: t.codigo,
      })),
      alunos: alunos.map((a) => ({
        id: a.id,
        turmaId: a.turmaId,
        nome: a.nome,
        codigo: a.matricula,
        avatarSvg: a.avatar?.svg ?? null,
        ultimoAcesso: a.ultimoAcesso,
        // acesso ao app (ADR 0017): o professor repassa o código; o PIN só o aluno sabe
        codigoAcesso: a.codigoAcesso,
        pinCriado: a.pinHash !== null,
        bloqueadoAte: a.bloqueadoAte && a.bloqueadoAte > new Date() ? a.bloqueadoAte : null,
      })),
      jogadas: jogadas.map((j) => ({
        id: j.id,
        alunoId: j.alunoId,
        origem: j.origem,
        // no painel, cada missão ou atividade é uma "atividade" para os indicadores
        missaoId: j.missaoId ?? j.atividadeId ?? `avulsa-${j.id}`,
        atividadeId: j.atividadeId,
        titulo: j.titulo,
        formato: j.formatoId,
        rodadas: j.rodadas,
        acertosDePrimeira: j.acertosDePrimeira,
        tentativas: j.tentativas,
        percentualConclusao: j.percentualConclusao,
        percentualAcerto: j.percentualAcerto,
        tempoSegundos: j.tempoSegundos,
        estrelas: j.estrelas,
        dicas: j.dicas,
        data: dataIso(j.data),
      })),
    };
  }

  // ─────────────────────────── atividades ───────────────────────────

  private async atividadeDoProfessor(professorId: string, id: string) {
    const a = await this.banco.atividadeProfessor.findFirst({ where: { id, professorId }, include: incluirAtividade });
    if (!a) throw new NotFoundException("Atividade não encontrada.");
    return a;
  }

  /** Dados validados da atividade → colunas da tabela mãe. */
  private colunasDaAtividade(d: DadosAtividade) {
    return {
      titulo: d.titulo,
      formato: d.formato,
      instrucao: d.instrucao,
      habilidadeCodigo: d.habilidade || null,
      missaoId: d.formato === "pronta" ? d.missaoId : null,
      planoId: d.planoId || null,
      liberarEm: dataDoBanco(d.liberarEm),
    };
  }

  @Get("atividades")
  async atividades(@SessaoAtual() s: Sessao, @Query("planoId") planoId?: string) {
    const lista = await this.banco.atividadeProfessor.findMany({
      where: { professorId: s.sub, ...(planoId ? { planoId } : {}) },
      include: incluirAtividade,
      orderBy: { liberarEm: "desc" },
    });
    return lista.map(atividadeDoBanco);
  }

  @Get("atividades/:id")
  async atividade(@SessaoAtual() s: Sessao, @Param("id") id: string) {
    return atividadeDoBanco(await this.atividadeDoProfessor(s.sub, id));
  }

  /** Cria a atividade com as filhas (turmas, questões, opções) numa só operação. */
  @Post("atividades")
  async criar(@SessaoAtual() s: Sessao, @EquipeAtual() eu: Equipe, @Body() corpo: unknown) {
    const d = validar(atividadeSchema, corpo);
    await this.conferirTurmas(s.sub, d.turmas);
    await this.conferirReferencias(s.sub, d.habilidade ? [d.habilidade] : [], d.planoId || undefined);
    const criada = await this.banco.atividadeProfessor.create({
      data: {
        id: novoId("atv"),
        professorId: s.sub,
        ...this.colunasDaAtividade(d),
        turmas: { create: d.turmas.map((turmaId) => ({ turmaId })) },
        questoes: { create: questoesParaBanco(d.formato === "pronta" ? [] : d.questoes) },
      },
      include: incluirAtividade,
    });
    await registrar(this.banco, eu, "atividade.criada", { tipo: "atividade", id: criada.id, detalhe: criada.titulo });
    return atividadeDoBanco(criada);
  }

  /** Atualiza a mãe e troca as filhas (turmas e questões) na mesma transação. */
  @Put("atividades/:id")
  async editar(@SessaoAtual() s: Sessao, @Param("id") id: string, @Body() corpo: unknown) {
    const d = validar(atividadeSchema, corpo);
    await this.atividadeDoProfessor(s.sub, id);
    await this.conferirTurmas(s.sub, d.turmas);
    await this.conferirReferencias(s.sub, d.habilidade ? [d.habilidade] : [], d.planoId || undefined);
    const editada = await this.banco.atividadeProfessor.update({
      where: { id },
      data: {
        ...this.colunasDaAtividade(d),
        turmas: { deleteMany: {}, create: d.turmas.map((turmaId) => ({ turmaId })) },
        questoes: { deleteMany: {}, create: questoesParaBanco(d.formato === "pronta" ? [] : d.questoes) },
      },
      include: incluirAtividade,
    });
    return atividadeDoBanco(editada);
  }

  /** Envia para o app (ou volta para rascunho). */
  @Post("atividades/:id/envio")
  async mudarEnvio(
    @SessaoAtual() s: Sessao,
    @EquipeAtual() eu: Equipe,
    @Param("id") id: string,
    @Body() corpo: unknown,
  ) {
    const { enviar } = validar(envio, corpo);
    await this.atividadeDoProfessor(s.sub, id);
    const a = await this.banco.atividadeProfessor.update({
      where: { id },
      data: { status: enviar ? "enviada" : "rascunho", enviadaEm: enviar ? new Date() : null },
      include: incluirAtividade,
    });
    await registrar(this.banco, eu, enviar ? "atividade.enviada" : "atividade.recolhida", {
      tipo: "atividade",
      id,
      detalhe: a.titulo,
    });
    return atividadeDoBanco(a);
  }

  /** Exclui a atividade e as filhas; as jogadas dos alunos ficam no histórico (sem o vínculo). */
  @Delete("atividades/:id")
  async excluir(@SessaoAtual() s: Sessao, @EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const atividade = await this.atividadeDoProfessor(s.sub, id);
    await this.banco.atividadeProfessor.delete({ where: { id } });
    await registrar(this.banco, eu, "atividade.excluida", { tipo: "atividade", id, detalhe: atividade.titulo });
    return { ok: true };
  }

  /** Quem já fez a atividade, com o acerto da última vez (MOD-ATI-010). */
  @Get("atividades/:id/situacao")
  async situacao(@SessaoAtual() s: Sessao, @Param("id") id: string) {
    const a = await this.atividadeDoProfessor(s.sub, id);
    const [alunos, jogadas] = await Promise.all([
      this.banco.aluno.findMany({
        where: { turmaId: { in: a.turmas.map((t) => t.turmaId) }, ativo: true },
        orderBy: { nome: "asc" },
        include: { avatar: { select: { svg: true } } },
      }),
      this.banco.jogada.findMany({ where: { atividadeId: id }, orderBy: { data: "asc" } }),
    ]);
    const ultima = new Map(jogadas.map((j) => [j.alunoId, j]));
    return {
      alunos: alunos.map((al) => {
        const j = ultima.get(al.id);
        return {
          id: al.id,
          nome: al.nome,
          turmaId: al.turmaId,
          avatarSvg: al.avatar?.svg ?? null,
          concluiu: Boolean(j),
          acerto: j?.percentualAcerto ?? null,
          data: j ? dataIso(j.data) : null,
        };
      }),
    };
  }

  // ─────────────────────────── planos de aula ───────────────────────────

  private async planoDoProfessor(professorId: string, id: string) {
    const p = await this.banco.planoAula.findFirst({ where: { id, professorId }, include: incluirPlano });
    if (!p) throw new NotFoundException("Plano de aula não encontrado.");
    return p;
  }

  /** Confere turma, habilidades e missões; alunos acompanhados só da turma do plano (RN-23). */
  private async filhasDoPlano(professorId: string, d: DadosPlano) {
    await this.conferirTurmas(professorId, [d.turmaId]);
    await this.conferirReferencias(professorId, d.habilidades);
    const [missoes, alunos] = await Promise.all([
      this.banco.missao.findMany({ where: { id: { in: d.atividadesApp } }, select: { id: true } }),
      this.banco.aluno.findMany({ where: { id: { in: d.alunosFoco }, turmaId: d.turmaId }, select: { id: true } }),
    ]);
    if (missoes.length !== new Set(d.atividadesApp).size)
      throw new BadRequestException("Missão do app não encontrada.");
    return {
      habilidades: [...new Set(d.habilidades)].map((habilidadeCodigo) => ({ habilidadeCodigo })),
      formatos: [...new Set(d.formatos)].map((formatoId) => ({ formatoId })),
      missoes: missoes.map((m) => ({ missaoId: m.id })),
      alunosFoco: alunos.map((a) => ({ alunoId: a.id })),
    };
  }

  private colunasDoPlano(d: DadosPlano) {
    return {
      turmaId: d.turmaId,
      data: dataDoBanco(d.data),
      horario: d.horario,
      aulas: d.aulas,
      tema: d.tema,
      unidadeNome: d.unidade,
      objetivos: d.objetivos,
      conteudos: d.conteudos,
      metodologia: d.metodologia,
      recursos: d.recursos,
      avaliacao: d.avaliacao,
      observacoes: d.observacoes,
      status: d.status,
      registro: d.registro,
    };
  }

  @Get("planos")
  async planos(@SessaoAtual() s: Sessao, @Query("turmaId") turmaId?: string, @Query("status") status?: string) {
    const lista = await this.banco.planoAula.findMany({
      where: {
        professorId: s.sub,
        ...(turmaId ? { turmaId } : {}),
        ...(status && (STATUS_PLANO as readonly string[]).includes(status)
          ? { status: status as (typeof STATUS_PLANO)[number] }
          : {}),
      },
      include: incluirPlano,
      orderBy: [{ data: "asc" }, { horario: "asc" }],
    });
    return lista.map(planoDoBanco);
  }

  @Get("planos/:id")
  async plano(@SessaoAtual() s: Sessao, @Param("id") id: string) {
    return planoDoBanco(await this.planoDoProfessor(s.sub, id));
  }

  @Post("planos")
  async criarPlano(@SessaoAtual() s: Sessao, @EquipeAtual() eu: Equipe, @Body() corpo: unknown) {
    const d = validar(planoSchema, corpo);
    const filhas = await this.filhasDoPlano(s.sub, d);
    const criado = await this.banco.planoAula.create({
      data: {
        id: novoId("plano"),
        professorId: s.sub,
        ...this.colunasDoPlano(d),
        habilidades: { create: filhas.habilidades },
        formatos: { create: filhas.formatos },
        missoes: { create: filhas.missoes },
        alunosFoco: { create: filhas.alunosFoco },
      },
      include: incluirPlano,
    });
    await registrar(this.banco, eu, "plano.criado", { tipo: "plano", id: criado.id, detalhe: criado.tema });
    return planoDoBanco(criado);
  }

  @Put("planos/:id")
  async editarPlano(@SessaoAtual() s: Sessao, @Param("id") id: string, @Body() corpo: unknown) {
    const d = validar(planoSchema, corpo);
    await this.planoDoProfessor(s.sub, id);
    const filhas = await this.filhasDoPlano(s.sub, d);
    const editado = await this.banco.planoAula.update({
      where: { id },
      data: {
        ...this.colunasDoPlano(d),
        habilidades: { deleteMany: {}, create: filhas.habilidades },
        formatos: { deleteMany: {}, create: filhas.formatos },
        missoes: { deleteMany: {}, create: filhas.missoes },
        alunosFoco: { deleteMany: {}, create: filhas.alunosFoco },
      },
      include: incluirPlano,
    });
    return planoDoBanco(editado);
  }

  /** Exclui o plano e as filhas; as atividades ligadas a ele continuam, sem o vínculo. */
  @Delete("planos/:id")
  async excluirPlano(@SessaoAtual() s: Sessao, @EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const plano = await this.planoDoProfessor(s.sub, id);
    await this.banco.planoAula.delete({ where: { id } });
    await registrar(this.banco, eu, "plano.excluido", { tipo: "plano", id, detalhe: plano.tema });
    return { ok: true };
  }
}
