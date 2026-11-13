import { ConflictException, Body, Controller, Get, Inject, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { NIVEIS, esquemaData, esquemaAtividade } from "@modolume/core";
import { esquemaJogada, referenciaDaJogadaValida } from "./jogada.js";
import { z } from "zod";
import { rostoDoAvatar } from "./acesso.js";
import { atividadeDoBanco, dataDoBanco, dataIso, incluirAtividade } from "./conversao.js";
import { Banco, GuardaAluno, SessaoAtual, hojeBrasil, validar, type Sessao } from "./infra.js";

import { lerProgressoAluno } from "./progresso-aluno.js";
import { publicacaoDoResultado } from "./publicacoes.js";

const dataIsoValida = esquemaData;
const idCurto = z.string().min(1).max(60);

const perfil = z.object({
  nome: z.string().trim().min(1).max(60).optional(),
  avatar: z
    .object({
      rosto: z.object({
        pele: z.number().int().min(0).max(20),
        cabelo: z.string().min(1).max(30),
        corCabelo: z.number().int().min(0).max(20),
        olhos: z.string().min(1).max(30),
        boca: z.string().min(1).max(30),
        acessorio: z.string().min(1).max(30),
        fundo: z.number().int().min(0).max(20),
      }),
      capa: z.number().int().min(0).max(50).nullish(),
      // SVG gerado no app (DiceBear); o painel mostra o mesmo rosto
      svg: z
        .string()
        .max(60_000)
        .refine((s) => s.startsWith("<svg") && !/<script|on\w+\s*=|javascript:/i.test(s), "Avatar inválido."),
    })
    .optional(),
});

const inteiro = (max: number) => z.number().int().min(0).max(max);
const lote = z.object({ jogadas: z.array(z.object({ id: z.string().min(8).max(80) }).passthrough()).max(300) });

/** Retrato do progresso de gamificação guardado no app (o mesmo formato do aparelho). */
const progresso = z.object({
  progresso: z
    .record(
      idCurto,
      z.object({ estrelas: z.number().int().min(0).max(3), jogadas: inteiro(100_000), melhorAcerto: inteiro(100) }),
    )
    .refine((r) => Object.keys(r).length <= 200),
  pontosPorNivel: z.record(z.string().regex(/^\d{1,2}$/), inteiro(1_000_000)),
  constelacoes: z.record(z.string().max(40), dataIsoValida),
  desafios: z.record(dataIsoValida, idCurto).refine((r) => Object.keys(r).length <= 2000),
  gastos: inteiro(1_000_000),
  compras: z.array(idCurto).max(200),
});

/** O que o app do aluno usa: perfil, envio de jogadas, progresso e atividades do professor. */
@Controller("aluno")
@UseGuards(GuardaAluno)
export class ControladorAluno {
  constructor(@Inject(Banco) private readonly banco: Banco) {}

  @Get("eu")
  async eu(@SessaoAtual() s: Sessao) {
    const aluno = await this.banco.aluno.findUniqueOrThrow({
      where: { id: s.sub },
      include: { turma: true, avatar: true },
    });
    return {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        avatar: aluno.avatar ? { rosto: rostoDoAvatar(aluno.avatar), svg: aluno.avatar.svg } : null,
      },
      turma: { id: aluno.turma.id, nome: aluno.turma.nome, serie: aluno.turma.serie },
    };
  }

  /** Nome e avatar escolhidos no app (avatar em tabela própria, uma linha por aluno). */
  @Patch("eu")
  async atualizar(@SessaoAtual() s: Sessao, @Body() corpo: unknown) {
    const { nome, avatar } = validar(perfil, corpo);
    await this.banco.$transaction(async (tx) => {
      if (nome) await tx.aluno.update({ where: { id: s.sub }, data: { nome } });
      if (avatar) {
        const dados = { ...avatar.rosto, capa: avatar.capa ?? null, svg: avatar.svg };
        await tx.avatarAluno.upsert({ where: { alunoId: s.sub }, create: { alunoId: s.sub, ...dados }, update: dados });
      }
    });
    return { ok: true };
  }

  /**
   * Jogadas feitas no app, inclusive as guardadas sem internet (MOD-HIS-005).
   * Reenviar a mesma jogada não duplica: o id vem do aparelho (MOD-CON-003).
   * As referências são conferidas: missão do catálogo e atividade enviada para a turma do aluno.
   */
  @Post("jogadas")
  async jogadas(@SessaoAtual() s: Sessao, @Body() corpo: unknown) {
    const { jogadas: entradas } = validar(lote, corpo);
    const jogadas = entradas.flatMap((entrada) => {
      const resultado = esquemaJogada.safeParse(entrada);
      return resultado.success ? [resultado.data] : [];
    });
    const missoes = await this.banco.missao.findMany({
      where: { id: { in: jogadas.map((j) => j.missaoId) } },
      select: { id: true, formatoId: true },
    });
    const missaoExiste = new Map(missoes.map((m) => [m.id, m]));
    const aceitas = [];
    for (const j of jogadas) {
      if (j.origem === "professor") {
        const publicada = await publicacaoDoResultado(this.banco, j, s.turmaId!, missaoExiste.get(j.missaoId));
        if (publicada) aceitas.push({ ...j, titulo: publicada.dados.titulo });
      } else if (j.data <= hojeBrasil() && referenciaDaJogadaValida(j, missaoExiste.get(j.missaoId), undefined))
        aceitas.push(j);
    }
    await this.banco.jogada.createMany({
      data: aceitas.map((j) => ({
        id: j.id,
        alunoId: s.sub,
        origem: j.origem,
        // atividade do professor que não é jogo do app não tem missão no catálogo
        missaoId: missaoExiste.has(j.missaoId) ? j.missaoId : null,
        atividadeId: j.atividadeId ?? null,
        publicacaoId: j.publicacaoId ?? null,
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
        fases: j.fases,
        data: dataDoBanco(j.data),
      })),
      skipDuplicates: true,
    });
    // Confirma reenvios do mesmo aluno, inclusive após mudança no catálogo.
    // Uma colisão de ID com outro aluno não pode ser confirmada.
    const persistidas = await this.banco.jogada.findMany({
      where: { alunoId: s.sub, id: { in: entradas.map((entrada) => entrada.id) } },
      select: { id: true },
    });
    const recebidas = new Set(persistidas.map((linha) => linha.id));
    return {
      recebidas: [...recebidas],
      recusadas: [...new Set(entradas.map((entrada) => entrada.id).filter((id) => !recebidas.has(id)))],
    };
  }

  /** Progresso guardado no servidor: o aluno recupera tudo ao entrar em outro aparelho (MOD-HIS-006). */
  @Get("progresso")
  async lerProgresso(@SessaoAtual() s: Sessao) {
    return this.banco.$transaction((tx) => lerProgressoAluno(tx, s.sub));
  }

  /**
   * Recebe o retrato do aparelho e junta com o do servidor:
   * fica sempre o maior valor (estrelas, pontos, gastos) e a união das conquistas.
   */
  @Put("progresso")
  async gravarProgresso(@SessaoAtual() s: Sessao, @Body() corpo: unknown) {
    const p = validar(progresso, corpo);
    const idsMissoes = [...Object.keys(p.progresso), ...Object.values(p.desafios)];
    const missoesValidas = new Set(
      (await this.banco.missao.findMany({ where: { id: { in: idsMissoes } }, select: { id: true } })).map((m) => m.id),
    );
    const mapaDaConstelacao = new Map(NIVEIS.map((n) => [n.constelacao, n.numero]));
    const numerosDeMapa = new Set(NIVEIS.map((n) => n.numero));

    await this.banco.$transaction(async (tx) => {
      // Serializa retratos do mesmo aluno, para uma leitura antiga não sobrescrever outra atualização.
      await tx.$queryRaw`SELECT id FROM aluno WHERE id = ${s.sub} FOR UPDATE`;
      const versao = await tx.aluno.findUniqueOrThrow({ where: { id: s.sub }, select: { progressoRevisao: true } });
      if (versao.progressoRevisao > 0)
        throw new ConflictException("Atualize o app para sincronizar o progresso com segurança.");
      for (const [missaoId, v] of Object.entries(p.progresso)) {
        if (!missoesValidas.has(missaoId)) continue;
        const chave = { alunoId_missaoId: { alunoId: s.sub, missaoId } };
        const atual = await tx.progressoMissao.findUnique({ where: chave });
        const dados = {
          estrelas: Math.max(atual?.estrelas ?? 0, v.estrelas),
          vezes: Math.max(atual?.vezes ?? 0, v.jogadas),
          melhorAcerto: Math.max(atual?.melhorAcerto ?? 0, v.melhorAcerto),
        };
        await tx.progressoMissao.upsert({
          where: chave,
          create: { alunoId: s.sub, missaoId, ...dados },
          update: dados,
        });
      }
      for (const [num, pontos] of Object.entries(p.pontosPorNivel)) {
        const mapaNumero = Number(num);
        if (!numerosDeMapa.has(mapaNumero)) continue;
        const chave = { alunoId_mapaNumero: { alunoId: s.sub, mapaNumero } };
        const valor = Math.max((await tx.pontoMapa.findUnique({ where: chave }))?.pontos ?? 0, pontos);
        await tx.pontoMapa.upsert({
          where: chave,
          create: { alunoId: s.sub, mapaNumero, pontos: valor },
          update: { pontos: valor },
        });
      }
      await tx.constelacaoConquistada.createMany({
        data: Object.entries(p.constelacoes).flatMap(([id, data]) => {
          const mapaNumero = mapaDaConstelacao.get(id);
          return mapaNumero ? [{ alunoId: s.sub, mapaNumero, data: dataDoBanco(data) }] : [];
        }),
        skipDuplicates: true,
      });
      await tx.desafioConcluido.createMany({
        data: Object.entries(p.desafios)
          .filter(([, missaoId]) => missoesValidas.has(missaoId))
          .map(([data, missaoId]) => ({ alunoId: s.sub, data: dataDoBanco(data), missaoId })),
        skipDuplicates: true,
      });
      await tx.compraLoja.createMany({
        data: p.compras.map((itemId) => ({ alunoId: s.sub, itemId })),
        skipDuplicates: true,
      });
      const aluno = await tx.aluno.findUniqueOrThrow({ where: { id: s.sub }, select: { luzesGastas: true } });
      if (p.gastos > aluno.luzesGastas)
        await tx.aluno.update({ where: { id: s.sub }, data: { luzesGastas: p.gastos } });
    });
    return { ok: true };
  }

  /** Atividades enviadas pelo professor para a turma, já liberadas, com o que o aluno já fez. */
  @Get("atividades")
  async atividades(@SessaoAtual() s: Sessao) {
    const [lista, feitas] = await Promise.all([
      this.banco.atividadeProfessor.findMany({
        where: {
          status: "enviada",
          arquivada: false,
          turmas: { some: { turmaId: s.turmaId! } },
          liberarEm: { lte: dataDoBanco(hojeBrasil()) },
        },
        include: {
          ...incluirAtividade,
          publicacoes: {
            orderBy: { numero: "desc" },
            take: 1,
            select: { id: true, numero: true, conteudo: true, prazo: true },
          },
        },
        orderBy: { liberarEm: "desc" },
      }),
      this.banco.jogada.findMany({
        where: { alunoId: s.sub, origem: "professor", atividadeId: { not: null } },
        select: { atividadeId: true, publicacaoId: true, percentualAcerto: true, estrelas: true, data: true },
        orderBy: [{ recebidaEm: "asc" }, { id: "asc" }],
      }),
    ]);
    return {
      atividades: lista.map((linha) => {
        const a = atividadeDoBanco(linha);
        const publicacao = linha.publicacoes[0];
        const conteudo = publicacao ? esquemaAtividade.parse(publicacao.conteudo) : a;
        const prazo = publicacao ? (publicacao.prazo ? dataIso(publicacao.prazo) : "") : a.prazo;
        const f = [...feitas]
          .reverse()
          .find(
            (f) =>
              f.atividadeId === a.id &&
              (f.publicacaoId === a.publicacaoId || (!f.publicacaoId && linha.publicacoes[0]?.numero === 1)),
          );
        return {
          id: a.id,
          publicacaoId: a.publicacaoId,
          publicacaoNumero: a.publicacaoNumero,
          titulo: conteudo.titulo,
          formato: conteudo.formato,
          instrucao: conteudo.instrucao,
          habilidade: conteudo.habilidade,
          missaoId: conteudo.missaoId,
          questoes: conteudo.questoes,
          liberarEm: conteudo.liberarEm,
          prazo: prazo ?? "",
          encerrada: Boolean(prazo && prazo < hojeBrasil()),
          feita: f ? { percentualAcerto: f.percentualAcerto, estrelas: f.estrelas, data: dataIso(f.data) } : null,
        };
      }),
    };
  }
}
