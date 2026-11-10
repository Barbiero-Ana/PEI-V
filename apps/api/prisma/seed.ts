import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  ATIVIDADES_EXEMPLO,
  FORMATOS_ATIVIDADE,
  HABILIDADES_BNCC,
  MISSOES,
  NIVEIS,
  PLANOS_EXEMPLO,
  UNIDADES_TEMATICAS,
  criarDadosDemonstracao,
} from "@modolume/core";
import { gerarCodigoAcesso } from "../src/codigo-acesso.js";
import { dataDoBanco, questoesParaBanco } from "../src/conversao.js";

/**
 * Dados iniciais do banco, em ordem de dependência (mães antes das filhas):
 * 1. catálogos (formatos, mapas, missões, habilidades, unidades);
 * 2. escola (instituição, professora, turmas, vínculos, alunos);
 * 3. histórico de demonstração (jogadas ligadas a missões reais do catálogo);
 * 4. planos de aula e atividades do professor, com as tabelas filhas.
 *
 * Os catálogos são atualizados sempre (upsert). O resto só é criado com o banco
 * vazio; para recomeçar do zero: `pnpm db:seed -- --recomecar`.
 */
const prisma = new PrismaClient();
const recomecar = process.argv.includes("--recomecar");

/** Códigos fáceis de ditar em sala (sem O/0 nem I/1). */
const CODIGOS: Record<string, string> = { "turma-6a": "LUZ6AM", "turma-6b": "LUZ6BT" };

async function catalogos() {
  for (const f of FORMATOS_ATIVIDADE)
    await prisma.formatoAtividade.upsert({
      where: { id: f.id },
      create: { id: f.id, rotulo: f.rotulo },
      update: { rotulo: f.rotulo },
    });
  for (const n of NIVEIS)
    await prisma.mapa.upsert({
      where: { numero: n.numero },
      create: { numero: n.numero, titulo: n.titulo, constelacao: n.constelacao },
      update: { titulo: n.titulo, constelacao: n.constelacao },
    });
  for (const n of NIVEIS)
    for (const [ordem, id] of n.missoes.entries()) {
      const m = MISSOES.find((x) => x.id === id)!;
      const dados = { mapaNumero: n.numero, formatoId: m.formato, titulo: m.titulo, conteudo: m.conteudo, ordem };
      await prisma.missao.upsert({ where: { id }, create: { id, ...dados }, update: dados });
    }
  for (const h of HABILIDADES_BNCC)
    await prisma.habilidadeBncc.upsert({ where: { codigo: h.codigo }, create: { ...h }, update: { resumo: h.resumo } });
  for (const nome of UNIDADES_TEMATICAS)
    await prisma.unidadeTematica.upsert({ where: { nome }, create: { nome }, update: {} });
}

async function apagarTudo() {
  // filhas antes das mães
  await prisma.$transaction([
    prisma.jogada.deleteMany(),
    prisma.atividadeProfessor.deleteMany(),
    prisma.planoAula.deleteMany(),
    prisma.avatarAluno.deleteMany(),
    prisma.progressoMissao.deleteMany(),
    prisma.pontoMapa.deleteMany(),
    prisma.constelacaoConquistada.deleteMany(),
    prisma.desafioConcluido.deleteMany(),
    prisma.compraLoja.deleteMany(),
    prisma.aluno.deleteMany(),
    prisma.professorTurma.deleteMany(),
    prisma.turma.deleteMany(),
    prisma.professor.deleteMany(),
    prisma.materia.deleteMany(),
    prisma.instituicao.deleteMany(),
  ]);
}

/**
 * Coordenação e administração de demonstração (PRD-01, PRD-02), na primeira
 * escola. Idempotente: só cria quem ainda não existe, sem mexer nos demais.
 */
async function equipeDemo() {
  const escola = await prisma.instituicao.findFirst({ orderBy: { criadoEm: "asc" } });
  if (!escola) return;
  const senhaHash = await bcrypt.hash(process.env.SENHA_DEMO ?? "modolume2026", 10);
  const pessoas = [
    {
      id: "coord-helena",
      nome: "Helena Prado",
      email: "coordenacao@escola.example",
      papel: "coordenacao" as const,
      segmento: "fundamental_ii" as const,
    },
    { id: "admin-rafael", nome: "Rafael Costa", email: "admin@escola.example", papel: "admin" as const },
  ];
  for (const p of pessoas) {
    if (await prisma.professor.findUnique({ where: { email: p.email } })) continue;
    await prisma.professor.create({ data: { ...p, instituicaoId: escola.id, senhaHash, disciplina: null } });
    console.log(`  equipe de demonstração: ${p.nome} (${p.papel}) · ${p.email}`);
  }
}

async function main() {
  await catalogos();
  if (recomecar) await apagarTudo();
  else if ((await prisma.professor.count()) > 0) {
    await equipeDemo();
    console.log("Catálogos e equipe de demonstração atualizados. O banco já tem dados de escola (use --recomecar).");
    return;
  }

  const d = criarDadosDemonstracao();
  const senhaHash = await bcrypt.hash(process.env.SENHA_DEMO ?? "modolume2026", 10);

  await prisma.instituicao.createMany({ data: d.instituicoes.map((i) => ({ id: i.id, nome: i.nome })) });
  const materias = new Map<string, string>();
  for (const p of d.professores) {
    const chave = p.disciplina.toLowerCase();
    const materia = await prisma.materia.upsert({
      where: { instituicaoId_chave: { instituicaoId: p.instituicaoId, chave } },
      create: { id: `materia-${p.id}`, nome: p.disciplina, chave, instituicaoId: p.instituicaoId },
      update: {},
    });
    materias.set(p.id, materia.id);
  }
  await prisma.professor.createMany({
    data: d.professores.map((p) => ({
      id: p.id,
      instituicaoId: p.instituicaoId,
      nome: p.nome,
      email: p.email.toLowerCase(),
      senhaHash,
      disciplina: p.disciplina,
      materiaId: materias.get(p.id),
    })),
  });
  await prisma.turma.createMany({
    data: d.turmas.map((t) => ({
      id: t.id,
      instituicaoId: d.professores.find((p) => p.id === t.professorId)!.instituicaoId,
      nome: t.nome,
      serie: t.serie,
      segmento: "fundamental_ii",
      periodo: t.periodo === "manhã" ? "manha" : t.periodo,
      anoLetivo: 2026,
      codigo: CODIGOS[t.id] ?? `LUZ${t.id.slice(-2).toUpperCase()}`,
    })),
  });
  await prisma.professorTurma.createMany({
    data: d.turmas.map((t) => ({ professorId: t.professorId, turmaId: t.id, responsavel: true })),
  });
  await prisma.aluno.createMany({
    // cada aluno com o seu código pessoal de acesso ao app (ADR 0017); o PIN ele cria no primeiro acesso
    data: d.alunos.map((a) => ({
      id: a.id,
      turmaId: a.turmaId,
      nome: a.nome,
      matricula: a.codigo,
      codigoAcesso: gerarCodigoAcesso(),
    })),
  });

  // histórico de demonstração: cada atividade antiga vira uma missão real do mapa, do mesmo formato
  const aplicacoes = new Map(d.aplicacoes.map((a) => [a.id, a]));
  const atividades = new Map(d.atividades.map((a) => [a.id, a]));
  const missaoDe = new Map(
    d.atividades.map((a, i) => {
      const doFormato = MISSOES.filter((m) => m.formato === a.formato);
      return [a.id, doFormato[i % doFormato.length] ?? MISSOES[0]!];
    }),
  );
  const RODADAS = 5;
  await prisma.jogada.createMany({
    data: d.resultados.flatMap((r) => {
      const ap = aplicacoes.get(r.aplicacaoId);
      const at = ap ? atividades.get(ap.atividadeId) : undefined;
      if (!ap || !at) return [];
      const missao = missaoDe.get(at.id)!;
      const primeira = Math.min(RODADAS, Math.round((r.percentualAcerto / 100) * RODADAS));
      return [
        {
          id: `demo-${r.id}`,
          alunoId: r.alunoId,
          origem: "mapa" as const,
          missaoId: missao.id,
          formatoId: missao.formato,
          titulo: missao.titulo,
          rodadas: RODADAS,
          acertosDePrimeira: primeira,
          tentativas: r.tentativas,
          percentualConclusao: r.percentualConclusao,
          percentualAcerto: r.percentualAcerto,
          tempoSegundos: r.tempoSegundos,
          estrelas: r.percentualAcerto >= 90 ? 3 : r.percentualAcerto >= 60 ? 2 : 1,
          dicas: r.percentualAcerto < 60 ? 2 : r.percentualAcerto < 80 ? 1 : 0,
          data: dataDoBanco(ap.data),
        },
      ];
    }),
  });

  // planos de aula (antes na memória do painel) com as tabelas filhas
  for (const p of PLANOS_EXEMPLO) {
    await prisma.planoAula.create({
      data: {
        id: p.id,
        professorId: p.professorId,
        turmaId: p.turmaId,
        data: dataDoBanco(p.data),
        horario: p.horario,
        aulas: p.aulas,
        tema: p.tema,
        unidadeNome: p.unidade,
        objetivos: p.objetivos,
        conteudos: p.conteudos,
        metodologia: p.metodologia,
        recursos: p.recursos,
        avaliacao: p.avaliacao,
        observacoes: p.observacoes,
        status: p.status,
        registro: p.registro,
        habilidades: { create: p.habilidades.map((habilidadeCodigo) => ({ habilidadeCodigo })) },
        formatos: { create: p.formatos.map((formatoId) => ({ formatoId })) },
        missoes: { create: p.atividadesApp.map((missaoId) => ({ missaoId })) },
        alunosFoco: { create: p.alunosFoco.map((alunoId) => ({ alunoId })) },
      },
    });
  }

  // atividades do professor: questões e opções em tabelas próprias; turmas pelo vínculo
  for (const a of ATIVIDADES_EXEMPLO) {
    await prisma.atividadeProfessor.create({
      data: {
        id: a.id,
        professorId: a.professorId,
        titulo: a.titulo,
        formato: a.formato,
        instrucao: a.instrucao,
        habilidadeCodigo: a.habilidade || null,
        missaoId: a.formato === "pronta" ? a.missaoId : null,
        planoId: a.planoId || null,
        liberarEm: dataDoBanco(a.liberarEm),
        status: a.status,
        enviadaEm: a.enviadaEm ? new Date(`${a.enviadaEm}T12:00:00Z`) : null,
        turmas: { create: a.turmas.map((turmaId) => ({ turmaId })) },
        questoes: { create: questoesParaBanco(a.questoes) },
      },
    });
  }

  const contar = async (nome: string, n: Promise<number>) => console.log(`  ${nome}: ${await n}`);
  console.log("Seed pronto:");
  await contar("missões no catálogo", prisma.missao.count());
  await contar("turmas", prisma.turma.count());
  await contar("alunos", prisma.aluno.count());
  await contar("jogadas", prisma.jogada.count());
  await contar("planos de aula", prisma.planoAula.count());
  await contar("atividades", prisma.atividadeProfessor.count());
  await equipeDemo();
  await contar("questões", prisma.questaoAtividade.count());
  await contar("opções de questões", prisma.opcaoQuestao.count());
  for (const [id, codigo] of Object.entries(CODIGOS)) console.log(`  código da ${id}: ${codigo}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
