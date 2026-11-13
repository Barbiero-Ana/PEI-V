import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { esquemaAvaliacao } from "@modolume/core";
import { Banco, EquipeAtual, GuardaProfessor, registrar, validar, type Equipe } from "./infra.js";

@Controller("professor")
@UseGuards(GuardaProfessor)
export class ControladorAvaliacoes {
  constructor(@Inject(Banco) private readonly banco: Banco) {}

  private escopoAluno(eu: Equipe, alunoId: string) {
    return {
      id: alunoId,
      ativo: true,
      turma: { ativa: true, instituicaoId: eu.instituicaoId, professores: { some: { professorId: eu.id } } },
    };
  }

  private async conferir(eu: Equipe, atividadeId: string, alunoId: string) {
    const aluno = await this.banco.aluno.findFirst({ where: this.escopoAluno(eu, alunoId) });
    const atividade =
      aluno &&
      (await this.banco.atividadeProfessor.findFirst({
        where: {
          id: atividadeId,
          arquivada: false,
          professorId: eu.id,
          turmas: { some: { turmaId: aluno.turmaId } },
        },
      }));
    if (!aluno || !atividade) throw new NotFoundException("Atividade ou aluno não encontrado.");
    return atividade;
  }

  @Get("atividades/:id/alunos/:alunoId")
  async detalhe(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Param("alunoId") alunoId: string) {
    const atividade = await this.conferir(eu, id, alunoId);
    const [jogadas, avaliacoes] = await Promise.all([
      this.banco.jogada.findMany({
        where: { alunoId, atividadeId: id },
        orderBy: [{ recebidaEm: "desc" }, { id: "desc" }],
      }),
      this.banco.avaliacaoAtividade.findMany({
        where: { alunoId, atividadeId: id, professorId: eu.id },
        orderBy: [{ criadaEm: "desc" }, { id: "desc" }],
      }),
    ]);
    return { titulo: atividade.titulo, habilidade: atividade.habilidadeCodigo, jogadas, avaliacoes };
  }

  @Post("atividades/:id/alunos/:alunoId/avaliacoes")
  async salvar(
    @EquipeAtual() eu: Equipe,
    @Param("id") id: string,
    @Param("alunoId") alunoId: string,
    @Body() corpo: unknown,
  ) {
    const entrada = validar(esquemaAvaliacao, corpo);
    return this.banco.$transaction(async (tx) => {
      // Serializa com edição/exclusão da atividade e revalida o vínculo dentro da transação.
      await tx.$queryRaw`SELECT id FROM atividade_professor WHERE id = ${id} FOR UPDATE`;
      const aluno = await tx.aluno.findFirst({ where: this.escopoAluno(eu, alunoId) });
      const atividade =
        aluno &&
        (await tx.atividadeProfessor.findFirst({
          where: { id, arquivada: false, professorId: eu.id, turmas: { some: { turmaId: aluno.turmaId } } },
        }));
      const jogada =
        atividade && (await tx.jogada.findFirst({ where: { id: entrada.jogadaId, alunoId, atividadeId: id } }));
      if (!jogada || !atividade) throw new NotFoundException("Resultado não encontrado nesta atividade.");
      const anterior = await tx.avaliacaoAtividade.findUnique({ where: { id: entrada.id } });
      if (anterior) {
        if (
          anterior.alunoId !== alunoId ||
          anterior.atividadeId !== id ||
          anterior.professorId !== eu.id ||
          anterior.jogadaId !== entrada.jogadaId ||
          anterior.feedback !== entrada.feedback ||
          anterior.publicada !== entrada.publicar ||
          anterior.percepcao !== entrada.percepcao
        )
          throw new ConflictException("Esta versão já foi salva. Atualize a página para registrar outra avaliação.");
        return anterior;
      }
      const avaliacao = await tx.avaliacaoAtividade.create({
        data: {
          id: entrada.id,
          alunoId,
          atividadeId: id,
          professorId: eu.id,
          jogadaId: entrada.jogadaId,
          tituloAtividade: atividade.titulo,
          habilidadeCodigo: atividade.habilidadeCodigo,
          feedback: entrada.feedback,
          percepcao: entrada.percepcao,
          publicada: entrada.publicar,
        },
      });
      await registrar(tx, eu, entrada.publicar ? "avaliacao.publicada" : "avaliacao.rascunho", {
        tipo: "avaliacao",
        id: avaliacao.id,
        detalhe: atividade.titulo,
      });
      return avaliacao;
    });
  }

  @Get("avaliacoes/pendentes")
  async pendentes(@EquipeAtual() eu: Equipe) {
    const atividades = await this.banco.atividadeProfessor.findMany({
      where: { professorId: eu.id, arquivada: false },
      include: {
        turmas: { select: { turmaId: true } },
        jogadas: {
          where: {
            aluno: {
              ativo: true,
              turma: { ativa: true, instituicaoId: eu.instituicaoId, professores: { some: { professorId: eu.id } } },
            },
          },
          include: { aluno: { select: { turmaId: true } } },
          orderBy: [{ recebidaEm: "desc" }, { id: "desc" }],
        },
        avaliacoes: { where: { publicada: true }, select: { jogadaId: true } },
      },
    });
    return atividades.flatMap((a) => {
      const ultimas = new Map<string, (typeof a.jogadas)[number]>();
      for (const j of a.jogadas) if (!ultimas.has(j.alunoId)) ultimas.set(j.alunoId, j);
      const quantidade = [...ultimas.values()].filter((j) => !a.avaliacoes.some((v) => v.jogadaId === j.id)).length;
      return quantidade ? [{ id: a.id, titulo: a.titulo, quantidade }] : [];
    });
  }

  @Get("alunos/:id/avaliacoes")
  async historico(@EquipeAtual() eu: Equipe, @Param("id") id: string) {
    if (!(await this.banco.aluno.findFirst({ where: this.escopoAluno(eu, id) })))
      throw new NotFoundException("Aluno não encontrado.");
    return (
      await this.banco.avaliacaoAtividade.findMany({
        where: { alunoId: id, professorId: eu.id },
        include: { atividade: { select: { titulo: true } } },
        orderBy: [{ criadaEm: "desc" }, { id: "desc" }],
      })
    ).map((a) => ({ ...a, atividade: { titulo: a.tituloAtividade } }));
  }
}
