import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { dataIso } from "./conversao.js";
import { Banco, EquipeAtual, GuardaCoordenacao, registrar, validar, type Equipe } from "./infra.js";
import { conferirTurmaAtiva, incluirProfessor, turmaParaVinculo } from "./vinculo-turma.js";

/**
 * Área da coordenação (PRD-03 e PRD-12): acompanha seu segmento, com os
 * parâmetros gerais e o desempenho de cada turma, consulta os dados
 * individuais dos alunos e vincula professores às turmas. Não cria atividades
 * nem planos de aula (isso é do professor). Tudo recortado pela instituição.
 */

const JANELA_DIAS = 30;
const SEM_JOGAR_DIAS = 14;
/** Aluno pede atenção: acerto médio abaixo disto, com amostra mínima (não rotula com pouca evidência). */
const ACERTO_ATENCAO = 60;
const AMOSTRA_MINIMA = 3;

const periodoTexto = (p: "manha" | "tarde" | "integral") => (p === "manha" ? "manhã" : p);
const media = (xs: number[]) => (xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : null);
const diasAtras = (n: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

type JogadaResumo = {
  alunoId: string;
  formatoId: string;
  percentualAcerto: number;
  percentualConclusao: number;
  data: Date;
};

/** Acerto e quantidade por formato (para barras e pentagrama da coordenação). */
function porFormato(jogadas: JogadaResumo[], rotulos: Map<string, string>) {
  const grupos = new Map<string, number[]>();
  for (const j of jogadas) grupos.set(j.formatoId, [...(grupos.get(j.formatoId) ?? []), j.percentualAcerto]);
  return [...grupos.entries()]
    .map(([formato, xs]) => ({
      formato,
      rotulo: rotulos.get(formato) ?? formato,
      acertoMedio: media(xs)!,
      amostra: xs.length,
    }))
    .sort((a, b) => b.amostra - a.amostra);
}

const vinculo = z.object({ professorId: z.string().min(1, "Escolha o professor.").max(40) });

const turmasDoSegmento = (eu: Equipe): Prisma.TurmaWhereInput => ({
  instituicaoId: eu.instituicaoId,
  ...(eu.segmento ? { segmento: eu.segmento } : { AND: [{ id: { in: [] } }] }),
});

@Controller("coordenacao")
@UseGuards(GuardaCoordenacao)
export class ControladorCoordenacao {
  constructor(@Inject(Banco) private readonly banco: Banco) {}

  private async rotulosDosFormatos() {
    const f = await this.banco.formatoAtividade.findMany({ select: { id: true, rotulo: true } });
    return new Map(f.map((x) => [x.id, x.rotulo]));
  }

  /** Parâmetros gerais da escola e de cada turma (últimos 30 dias), e a equipe de professores. */
  @Get("visao")
  async visao(@EquipeAtual() eu: Equipe) {
    const inst = eu.instituicaoId;
    const escopo = { ...turmasDoSegmento(eu), ativa: true };
    const desde = diasAtras(JANELA_DIAS);
    const [instituicao, turmas, jogadas, professores, rotulos] = await Promise.all([
      this.banco.instituicao.findUniqueOrThrow({ where: { id: inst } }),
      this.banco.turma.findMany({
        where: escopo,
        orderBy: { nome: "asc" },
        include: {
          professores: { include: { professor: { select: { id: true, nome: true, disciplina: true, ativo: true } } } },
          alunos: { where: { ativo: true }, select: { id: true, ultimoAcesso: true } },
        },
      }),
      this.banco.jogada.findMany({
        where: { data: { gte: desde }, aluno: { ativo: true, turma: escopo } },
        select: {
          alunoId: true,
          formatoId: true,
          percentualAcerto: true,
          percentualConclusao: true,
          data: true,
          aluno: { select: { turmaId: true } },
        },
      }),
      eu.segmento
        ? this.banco.professor.findMany({
            where: { instituicaoId: inst, papel: "professor", ativo: true },
            orderBy: { nome: "asc" },
            select: {
              id: true,
              nome: true,
              disciplina: true,
              turmas: { where: { turma: escopo }, select: { turmaId: true } },
            },
          })
        : [],
      this.rotulosDosFormatos(),
    ]);

    const recente = diasAtras(7);
    const semJogarDesde = diasAtras(SEM_JOGAR_DIAS);
    const linhas = turmas.map((t) => {
      const daTurma = jogadas.filter((j) => j.aluno.turmaId === t.id);
      const porAluno = new Map<string, number[]>();
      for (const j of daTurma) porAluno.set(j.alunoId, [...(porAluno.get(j.alunoId) ?? []), j.percentualAcerto]);
      const atencao = [...porAluno.values()].filter(
        (xs) => xs.length >= AMOSTRA_MINIMA && media(xs)! < ACERTO_ATENCAO,
      ).length;
      const ativos7 = new Set(daTurma.filter((j) => j.data >= recente).map((j) => j.alunoId)).size;
      const jogaramRecente = new Set(daTurma.filter((j) => j.data >= semJogarDesde).map((j) => j.alunoId));
      return {
        id: t.id,
        nome: t.nome,
        serie: t.serie,
        segmento: t.segmento,
        periodo: periodoTexto(t.periodo),
        professores: t.professores
          .filter((v) => v.professor.ativo)
          .map((v) => ({ id: v.professor.id, nome: v.professor.nome, disciplina: v.professor.disciplina })),
        alunos: t.alunos.length,
        alunosAtivos7d: ativos7,
        participacao: t.alunos.length ? Math.round((ativos7 / t.alunos.length) * 100) : 0,
        jogadas: daTurma.length,
        acertoMedio: media(daTurma.map((j) => j.percentualAcerto)),
        conclusaoMedia: media(daTurma.map((j) => j.percentualConclusao)),
        alunosAtencao: atencao,
        semJogar: t.alunos.filter((a) => !jogaramRecente.has(a.id)).length,
        porFormato: porFormato(daTurma, rotulos),
      };
    });

    return {
      instituicao: { id: instituicao.id, nome: instituicao.nome },
      segmento: eu.segmento ?? null,
      janelaDias: JANELA_DIAS,
      escola: {
        turmas: linhas.length,
        alunos: linhas.reduce((s, l) => s + l.alunos, 0),
        professores: professores.filter((p) => p.turmas.length > 0).length,
        jogadas: jogadas.length,
        acertoMedio: media(jogadas.map((j) => j.percentualAcerto)),
        participacao: media(linhas.filter((l) => l.alunos > 0).map((l) => l.participacao)),
        alunosAtencao: linhas.reduce((s, l) => s + l.alunosAtencao, 0),
        turmasSemProfessor: linhas.filter((l) => l.professores.length === 0).length,
        porFormato: porFormato(jogadas, rotulos),
      },
      turmas: linhas,
      professores: professores.map((p) => ({
        id: p.id,
        nome: p.nome,
        disciplina: p.disciplina,
        turmas: p.turmas.map((v) => v.turmaId),
      })),
    };
  }

  /** Uma turma: professores, alunos com o desempenho de cada um e a evolução semanal. */
  @Get("turmas/:id")
  async turma(@EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const turma = await this.banco.turma.findFirst({
      where: { ...turmasDoSegmento(eu), id },
      include: {
        professores: { include: { professor: { select: { id: true, nome: true, disciplina: true, ativo: true } } } },
        alunos: { where: { ativo: true }, orderBy: { nome: "asc" }, include: { avatar: { select: { svg: true } } } },
      },
    });
    if (!turma) throw new NotFoundException("Turma não encontrada.");
    const desde = diasAtras(42);
    const [jogadas, rotulos] = await Promise.all([
      this.banco.jogada.findMany({
        where: { aluno: { turmaId: id, ativo: true }, data: { gte: desde } },
        select: { alunoId: true, formatoId: true, percentualAcerto: true, percentualConclusao: true, data: true },
        orderBy: { data: "asc" },
      }),
      this.rotulosDosFormatos(),
    ]);
    const janela = diasAtras(JANELA_DIAS);
    const recentes = jogadas.filter((j) => j.data >= janela);

    // evolução: acerto médio por semana (6 semanas, da mais antiga para a atual)
    const semanas = Array.from({ length: 6 }, (_, i) => {
      const inicio = diasAtras(42 - i * 7);
      const fim = diasAtras(35 - i * 7);
      const xs = jogadas.filter((j) => j.data >= inicio && j.data < fim).map((j) => j.percentualAcerto);
      return { inicio: dataIso(inicio), acertoMedio: media(xs), jogadas: xs.length };
    });

    return {
      id: turma.id,
      nome: turma.nome,
      serie: turma.serie,
      periodo: periodoTexto(turma.periodo),
      anoLetivo: turma.anoLetivo,
      janelaDias: JANELA_DIAS,
      professores: turma.professores
        .filter((v) => v.professor.ativo)
        .map((v) => ({ id: v.professor.id, nome: v.professor.nome, disciplina: v.professor.disciplina })),
      acertoMedio: media(recentes.map((j) => j.percentualAcerto)),
      conclusaoMedia: media(recentes.map((j) => j.percentualConclusao)),
      porFormato: porFormato(recentes, rotulos),
      semanas,
      alunos: turma.alunos.map((a) => {
        const minhas = recentes.filter((j) => j.alunoId === a.id);
        const acerto = media(minhas.map((j) => j.percentualAcerto));
        const ultima = minhas.at(-1)?.data ?? null;
        return {
          id: a.id,
          nome: a.nome,
          avatarSvg: a.avatar?.svg ?? null,
          jogadas: minhas.length,
          acertoMedio: acerto,
          atencao: minhas.length >= AMOSTRA_MINIMA && acerto !== null && acerto < ACERTO_ATENCAO,
          ultimaJogada: ultima ? dataIso(ultima) : null,
          ultimoAcesso: a.ultimoAcesso,
        };
      }),
    };
  }

  /** Dados individuais do aluno, só para consulta (sem ações sobre o acesso). */
  @Get("alunos/:id")
  async aluno(@EquipeAtual() eu: Equipe, @Param("id") id: string) {
    const aluno = await this.banco.aluno.findFirst({
      where: { id, turma: turmasDoSegmento(eu) },
      include: { turma: { select: { id: true, nome: true } }, avatar: { select: { svg: true } } },
    });
    if (!aluno) throw new NotFoundException("Aluno não encontrado.");
    const [jogadas, rotulos] = await Promise.all([
      this.banco.jogada.findMany({
        where: { alunoId: id },
        orderBy: { data: "desc" },
        select: {
          id: true,
          titulo: true,
          origem: true,
          formatoId: true,
          percentualAcerto: true,
          percentualConclusao: true,
          tentativas: true,
          dicas: true,
          tempoSegundos: true,
          data: true,
          alunoId: true,
        },
      }),
      this.rotulosDosFormatos(),
    ]);
    return {
      id: aluno.id,
      nome: aluno.nome,
      matricula: aluno.matricula,
      turma: aluno.turma,
      ativo: aluno.ativo,
      avatarSvg: aluno.avatar?.svg ?? null,
      codigoAcesso: aluno.codigoAcesso,
      pinCriado: aluno.pinHash !== null,
      ultimoAcesso: aluno.ultimoAcesso,
      totais: {
        jogadas: jogadas.length,
        acertoMedio: media(jogadas.map((j) => j.percentualAcerto)),
        conclusaoMedia: media(jogadas.map((j) => j.percentualConclusao)),
        dicas: jogadas.reduce((s, j) => s + j.dicas, 0),
      },
      porFormato: porFormato(jogadas, rotulos),
      recentes: jogadas.slice(0, 15).map((j) => ({
        id: j.id,
        titulo: j.titulo,
        origem: j.origem,
        formato: rotulos.get(j.formatoId) ?? j.formatoId,
        acerto: j.percentualAcerto,
        tentativas: j.tentativas,
        dicas: j.dicas,
        tempoSegundos: j.tempoSegundos,
        data: dataIso(j.data),
      })),
    };
  }

  /** Vincula um professor da escola a uma turma. */
  @Post("turmas/:id/professores")
  async vincular(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Body() corpo: unknown) {
    const { professorId } = validar(vinculo, corpo);
    if (!eu.segmento) throw new NotFoundException("Turma não encontrada.");
    const segmento = eu.segmento;
    await this.banco.$transaction(async (transacao) => {
      const turma = await turmaParaVinculo(transacao, id, eu.instituicaoId, segmento);
      conferirTurmaAtiva(turma);
      const [professor] = await transacao.$queryRaw<{ nome: string; ativo: boolean; papel: string }[]>`
        SELECT nome, ativo, papel::text FROM professor
        WHERE id = ${professorId} AND instituicao_id = ${eu.instituicaoId} FOR UPDATE
      `;
      if (!professor?.ativo) throw new NotFoundException("Professor não encontrado.");
      if (professor.papel !== "professor")
        throw new BadRequestException("Só professores podem ser vinculados a turmas.");
      if (await incluirProfessor(transacao, id, professorId)) {
        await registrar(transacao, eu, "turma.vinculo", {
          tipo: "turma",
          id,
          detalhe: `${professor.nome} → ${turma.nome}`,
        });
      }
    });
    return { ok: true };
  }

  /** Tira o professor da turma. O histórico da turma (jogadas, atividades, planos) continua. */
  @Delete("turmas/:id/professores/:professorId")
  async desvincular(@EquipeAtual() eu: Equipe, @Param("id") id: string, @Param("professorId") professorId: string) {
    if (!eu.segmento) throw new NotFoundException("Vínculo não encontrado.");
    const segmento = eu.segmento;
    await this.banco.$transaction(async (transacao) => {
      const turma = await turmaParaVinculo(transacao, id, eu.instituicaoId, segmento);
      const v = await transacao.professorTurma.findUnique({
        where: { professorId_turmaId: { professorId, turmaId: id } },
        include: { professor: { select: { nome: true } } },
      });
      if (!v) return;
      const { count } = await transacao.professorTurma.deleteMany({ where: { turmaId: id, professorId } });
      if (count === 0) return;
      await registrar(transacao, eu, "turma.desvinculo", {
        tipo: "turma",
        id,
        detalhe: `${v.professor.nome} saiu de ${turma.nome}`,
      });
    });
    return { ok: true };
  }
}
