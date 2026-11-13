import { UnauthorizedException, Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { dataEscolar, comprarItem, creditarJogada, esquemaData, type ProgressoAluno } from "@modolume/core";
import { z } from "zod";
import { Banco, GuardaAluno, SessaoAtual, validar, hojeBrasil, type Sessao } from "./infra.js";
import { esquemaJogada, referenciaDaJogadaValida } from "./jogada.js";
import { dataDoBanco } from "./conversao.js";
import { importarProgressoLegado, lerProgressoAluno, salvarProgressoAluno } from "./progresso-aluno.js";

const contador = z.number().int().min(0).max(10_000_000);
const legado = z.object({
  progresso: z.record(
    z.string().max(60),
    z.object({
      estrelas: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
      jogadas: contador,
      melhorAcerto: z.number().int().min(0).max(100),
    }),
  ),
  pontosPorNivel: z.record(z.string().max(2), contador),
  constelacoes: z.record(z.string().max(40), esquemaData),
  desafios: z.record(esquemaData, z.string().max(60)),
  gastos: contador,
  compras: z.array(z.string().max(60)).max(200),
  dias: z.array(esquemaData).max(10000).default([]),
});
const esquema = z.object({
  dispositivoId: z.string().min(8).max(80),
  legado: legado.optional(),
  jogadas: z
    .array(z.object({ id: z.string().min(8).max(80), recompensar: z.boolean().default(false) }).passthrough())
    .max(100),
  compras: z.array(z.string().min(1).max(60)).max(200),
  inicios: z
    .array(z.object({ atividadeId: z.string().max(40), iniciadaEm: z.string().datetime() }))
    .max(100)
    .default([]),
});

@Controller("aluno")
@UseGuards(GuardaAluno)
export class ControladorSincronizacaoAluno {
  constructor(@Inject(Banco) private readonly banco: Banco) {}

  /** O histórico, os créditos e as compras são confirmados pela mesma transação. */
  @Post("sincronizar")
  async sincronizar(@SessaoAtual() s: Sessao, @Body() corpo: unknown) {
    const entrada = validar(esquema, corpo);
    return this.banco.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM aluno WHERE id = ${s.sub} FOR UPDATE`;
        const aluno = await tx.aluno.findUniqueOrThrow({
          where: { id: s.sub },
          include: { turma: { select: { ativa: true } } },
        });
        if (!aluno.ativo || !aluno.turma.ativa || aluno.turmaId !== s.turmaId || aluno.versaoAcesso !== s.v)
          throw new UnauthorizedException("Seu acesso mudou. Entre novamente.");
        let p: ProgressoAluno = await lerProgressoAluno(tx, s.sub);
        const chave = { alunoId_dispositivoId: { alunoId: s.sub, dispositivoId: entrada.dispositivoId } };
        if (!(await tx.importacaoProgresso.findUnique({ where: chave }))) {
          if (entrada.legado) p = await importarProgressoLegado(tx, s.sub, p, entrada.legado);
          await tx.importacaoProgresso.create({ data: { alunoId: s.sub, dispositivoId: entrada.dispositivoId } });
        }
        const iniciosConfirmados: string[] = [],
          iniciosRecusados: string[] = [];
        for (const i of entrada.inicios) {
          const a = await tx.atividadeProfessor.findFirst({
            where: {
              id: i.atividadeId,
              arquivada: false,
              status: "enviada",
              turmas: { some: { turmaId: s.turmaId! } },
            },
          });
          const dia = dataEscolar(new Date(i.iniciadaEm));
          if (
            !a ||
            dia < a.liberarEm.toISOString().slice(0, 10) ||
            (a.prazo && dia > a.prazo.toISOString().slice(0, 10)) ||
            dia > hojeBrasil()
          ) {
            iniciosRecusados.push(i.atividadeId);
            continue;
          }
          await tx.atividadeInicio.upsert({
            where: { alunoId_atividadeId: { alunoId: s.sub, atividadeId: i.atividadeId } },
            create: { alunoId: s.sub, atividadeId: i.atividadeId, iniciadaEm: new Date(i.iniciadaEm) },
            update: {},
          });
          iniciosConfirmados.push(i.atividadeId);
        }
        const motivosRecusa: Record<string, string> = {};
        const recebidas: string[] = [],
          recusadas: string[] = [];
        for (const e of entrada.jogadas) {
          const existente = await tx.jogada.findUnique({ where: { id: e.id } });
          if (existente) {
            (existente.alunoId === s.sub ? recebidas : recusadas).push(e.id);
            if (existente.alunoId !== s.sub)
              motivosRecusa[e.id] = "Não foi possível confirmar o identificador deste resultado.";
            continue;
          }
          const validada = esquemaJogada.safeParse(e);
          if (!validada.success) {
            recusadas.push(e.id);
            motivosRecusa[e.id] = "O resultado contém dados incompatíveis. A tentativa continua guardada no aparelho.";
            continue;
          }
          const j = validada.data;
          const missao = await tx.missao.findUnique({ where: { id: j.missaoId }, select: { formatoId: true } });
          const atividade = j.atividadeId
            ? await tx.atividadeProfessor.findFirst({
                where: { id: j.atividadeId, arquivada: false, turmas: { some: { turmaId: s.turmaId! } } },
              })
            : null;
          if (
            j.data > hojeBrasil() ||
            !referenciaDaJogadaValida(j, missao ?? undefined, atividade ?? undefined) ||
            (atividade &&
              (!atividade.enviadaEm ||
                j.data < atividade.liberarEm.toISOString().slice(0, 10) ||
                (atividade.prazo && j.data > atividade.prazo.toISOString().slice(0, 10))))
          ) {
            recusadas.push(j.id);
            motivosRecusa[j.id] =
              atividade?.prazo && j.data > atividade.prazo.toISOString().slice(0, 10)
                ? "A entrega foi concluída depois do prazo."
                : "A atividade mudou ou não está mais disponível para sua turma. Fale com seu professor.";
            continue;
          }
          await tx.jogada.create({
            data: {
              id: j.id,
              alunoId: s.sub,
              origem: j.origem,
              missaoId: missao ? j.missaoId : null,
              atividadeId: j.atividadeId ?? null,
              formatoId: j.formato,
              titulo: j.titulo,
              rodadas: j.rodadas,
              acertosDePrimeira: j.acertosDePrimeira,
              tentativas: j.tentativas,
              percentualConclusao: j.percentualConclusao,
              percentualAcerto: j.percentualAcerto,
              tempoSegundos: j.tempoSegundos,
              estrelas: j.estrelas,
              dicas: j.dicas,
              data: dataDoBanco(j.data),
              fases: j.fases,
            },
          });
          if (e.recompensar && missao) p = creditarJogada(p, { ...j, estrelas: j.estrelas as 1 | 2 | 3 });
          recebidas.push(j.id);
        }
        const comprasConfirmadas: string[] = [],
          comprasRecusadas: string[] = [];
        for (const id of [...new Set(entrada.compras)]) {
          const novo = comprarItem(p, id);
          if (novo) {
            p = novo;
            comprasConfirmadas.push(id);
          } else comprasRecusadas.push(id);
        }
        await salvarProgressoAluno(tx, s.sub, p);
        return {
          recebidas,
          recusadas,
          motivosRecusa,
          iniciosConfirmados,
          iniciosRecusados,
          comprasConfirmadas,
          comprasRecusadas,
          progresso: await lerProgressoAluno(tx, s.sub),
        };
      },
      { timeout: 30000 },
    );
  }
}
