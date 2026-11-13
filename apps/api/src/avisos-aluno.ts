import { Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { dataEscolar, type AvisoAluno } from "@modolume/core";
import { z } from "zod";
import { Banco, GuardaAluno, SessaoAtual, hojeBrasil, validar, type Sessao } from "./infra.js";
import { dataDoBanco, dataIso } from "./conversao.js";

/** Avisos derivados de dados persistidos. Não dependem de push, cron ou permissão do aparelho. */
export async function avisosDoAluno(banco: Banco, s: Sessao): Promise<AvisoAluno[]> {
  const hoje = hojeBrasil();
  const amanha = new Date(dataDoBanco(hoje));
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const [atividades, avaliacoes, feitas, leituras] = await Promise.all([
    banco.atividadeProfessor.findMany({
      include: { publicacoes: { orderBy: { numero: "desc" }, take: 1, select: { id: true, numero: true } } },
      where: {
        status: "enviada",
        arquivada: false,
        liberarEm: { lte: dataDoBanco(hoje) },
        turmas: { some: { turmaId: s.turmaId! } },
      },
    }),
    banco.avaliacaoAtividade.findMany({
      where: { alunoId: s.sub, publicada: true },
      include: { atividade: { select: { titulo: true } } },
      orderBy: { criadaEm: "desc" },
      take: 100,
    }),
    banco.jogada.findMany({
      where: { alunoId: s.sub, atividadeId: { not: null } },
      select: { atividadeId: true, publicacaoId: true },
    }),
    banco.leituraAvisoAluno.findMany({ where: { alunoId: s.sub }, select: { avisoId: true } }),
  ]);
  const lidas = new Set(leituras.map((l) => l.avisoId));
  const avisos: Omit<AvisoAluno, "lida">[] = [];
  for (const a of atividades) {
    const p = a.publicacoes?.[0];
    const concluida = feitas.some(
      (j) => j.atividadeId === a.id && (!p || j.publicacaoId === p.id || (!j.publicacaoId && p.numero === 1)),
    );
    if (a.prazo && dataIso(a.prazo) < hoje) continue;
    avisos.push({
      id: `atividade:${a.id}:${a.enviadaEm?.getTime() ?? 0}`,
      titulo: "Nova atividade do professor",
      texto: a.titulo,
      tipo: "atividade",
      atividadeId: a.id,
      data: dataIso(a.liberarEm),
    });
    if (a.prazo && dataIso(a.prazo) === dataIso(amanha) && !concluida)
      avisos.push({
        id: `prazo:${a.id}:${dataIso(a.prazo)}`,
        titulo: "Você tem uma atividade para amanhã",
        texto: a.titulo,
        tipo: "prazo",
        atividadeId: a.id,
        data: hoje,
      });
  }
  for (const a of avaliacoes)
    avisos.push({
      id: `avaliacao:${a.id}`,
      titulo: "Seu professor deixou uma orientação",
      texto: a.tituloAtividade,
      tipo: "avaliacao",
      atividadeId: a.atividadeId,
      avaliacaoId: a.id,
      data: dataEscolar(a.criadaEm),
    });
  return avisos
    .map((a) => ({ ...a, lida: lidas.has(a.id) }))
    .sort((a, b) => b.data.localeCompare(a.data) || a.id.localeCompare(b.id));
}

@Controller("aluno")
@UseGuards(GuardaAluno)
export class ControladorAvisosAluno {
  constructor(@Inject(Banco) private readonly banco: Banco) {}
  @Get("avisos")
  async listar(@SessaoAtual() s: Sessao) {
    return { avisos: await avisosDoAluno(this.banco, s) };
  }
  @Post("avisos/lidos")
  async ler(@SessaoAtual() s: Sessao, @Body() corpo: unknown) {
    const { ids } = validar(z.object({ ids: z.array(z.string().max(180)).max(500) }), corpo);
    const disponiveis = new Set((await avisosDoAluno(this.banco, s)).map((a) => a.id));
    await this.banco.leituraAvisoAluno.createMany({
      data: [...new Set(ids)].filter((id) => disponiveis.has(id)).map((avisoId) => ({ alunoId: s.sub, avisoId })),
      skipDuplicates: true,
    });
    return { ok: true };
  }
  @Get("avaliacoes")
  async avaliacoes(@SessaoAtual() s: Sessao) {
    return {
      avaliacoes: (
        await this.banco.avaliacaoAtividade.findMany({
          where: { alunoId: s.sub, publicada: true },
          select: {
            id: true,
            tituloAtividade: true,
            habilidadeCodigo: true,
            feedback: true,
            percepcao: true,
            criadaEm: true,
            atividadeId: true,
            atividade: { select: { titulo: true } },
            professor: { select: { nome: true } },
          },
          orderBy: [{ criadaEm: "desc" }, { id: "desc" }],
          take: 100,
        })
      ).map((a) => ({ ...a, atividade: { titulo: a.tituloAtividade } })),
    };
  }
}
