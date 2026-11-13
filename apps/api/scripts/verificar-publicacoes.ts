import assert from "node:assert/strict";
import { ControladorProfessor } from "../src/professor.js";
import { ControladorAluno } from "../src/aluno.js";
import { ControladorSincronizacaoAluno } from "../src/sincronizacao-aluno.js";
import { Banco, hojeBrasil, type Equipe } from "../src/infra.js";

export async function verificarPublicacoes(banco: Banco, eu: Equipe) {
  const professor = new ControladorProfessor(banco),
    aluno = new ControladorAluno(banco);
  const sincronizacao = new ControladorSincronizacaoAluno(banco);
  const sessaoProfessor = { sub: eu.id, papel: "professor" as const };
  const sessao = { sub: "pub-aluno", papel: "aluno" as const, turmaId: "pub-turma", v: 1 };
  await banco.turma.create({
    data: {
      id: "pub-turma",
      nome: "Teste de versões",
      instituicaoId: eu.instituicaoId,
      serie: "6º ano",
      periodo: "manha",
      anoLetivo: 2026,
      codigo: "PUB26",
      professores: { create: { professorId: eu.id } },
    },
  });
  await banco.aluno.create({
    data: {
      id: sessao.sub,
      nome: "Aluno fictício",
      turmaId: sessao.turmaId,
      matricula: "pub-1",
      codigoAcesso: "PUBA2345",
    },
  });
  const dados = {
    titulo: "Versão original",
    formato: "objetiva" as const,
    instrucao: "Escolha uma alternativa",
    habilidade: "",
    missaoId: "",
    planoId: "",
    turmas: [sessao.turmaId],
    liberarEm: hojeBrasil(),
    prazo: "",
    questoes: [
      {
        tipo: "objetiva" as const,
        enunciado: "Quanto é dois mais dois?",
        alternativas: ["4", "5"],
        correta: 0,
        feedbackErro: "Some dois grupos de dois.",
      },
    ],
  };
  const criada = await professor.criar(sessaoProfessor, eu, dados);
  const publicar = () => professor.mudarEnvio(sessaoProfessor, eu, criada.id, { enviar: true });
  const concorrentes = await Promise.all([publicar(), publicar()]);
  assert.equal(concorrentes[0]!.publicacaoId, concorrentes[1]!.publicacaoId);
  assert.equal(await banco.atividadePublicacao.count({ where: { atividadeId: criada.id } }), 1);
  const primeira = concorrentes[0]!;
  const original = await banco.atividadePublicacao.findUniqueOrThrow({ where: { id: primeira.publicacaoId! } });
  await assert.rejects(
    professor.editar(sessaoProfessor, eu, criada.id, { ...dados, titulo: "Tentativa de substituição" }),
    { status: 400 },
  );
  assert.equal((await professor.atividade(sessaoProfessor, criada.id)).titulo, dados.titulo);
  const amanha = new Date(`${hojeBrasil()}T12:00:00Z`);
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  await professor.alterarPrazo(sessaoProfessor, eu, criada.id, { prazo: amanha.toISOString().slice(0, 10) });
  assert.deepEqual(
    (await banco.atividadePublicacao.findUniqueOrThrow({ where: { id: original.id } })).conteudo,
    original.conteudo,
  );
  assert.equal((await professor.atividade(sessaoProfessor, criada.id)).publicacaoId, original.id);
  const resposta = {
    id: "pub-resposta-antiga",
    origem: "professor",
    atividadeId: criada.id,
    publicacaoId: original.id,
    missaoId: criada.id,
    titulo: "Título fornecido pelo cliente",
    formato: "objetiva",
    rodadas: 1,
    acertosDePrimeira: 1,
    tentativas: 1,
    percentualConclusao: 100,
    percentualAcerto: 100,
    tempoSegundos: 12,
    estrelas: 3,
    dicas: 0,
    data: hojeBrasil(),
  };
  const enviar = (j = resposta) =>
    sincronizacao.sincronizar(sessao, { dispositivoId: "pub-dispositivo", jogadas: [j], compras: [] });
  await professor.mudarEnvio(sessaoProfessor, eu, criada.id, { enviar: false });
  await professor.editar(sessaoProfessor, eu, criada.id, {
    ...dados,
    titulo: "Segunda versão",
    questoes: [...dados.questoes, { ...dados.questoes[0]!, enunciado: "Quanto é três mais três?" }],
  });
  const segunda = await publicar();
  assert.notEqual(segunda.publicacaoId, original.id);
  assert.equal(segunda.publicacaoNumero, 2);
  assert.deepEqual((await enviar()).recebidas, [resposta.id]);
  const gravada = await banco.jogada.findUniqueOrThrow({ where: { id: resposta.id } });
  assert.equal(gravada.publicacaoId, original.id);
  assert.equal(gravada.titulo, dados.titulo);
  assert.equal((await aluno.atividades(sessao)).atividades.find((a) => a.id === criada.id)?.feita, null);
  assert.deepEqual((await enviar()).recebidas, [resposta.id]);
  assert.equal(await banco.jogada.count({ where: { id: resposta.id } }), 1);
  assert.deepEqual(
    (await enviar({ ...resposta, id: "pub-versao-incompativel", publicacaoId: segunda.publicacaoId! })).recusadas,
    ["pub-versao-incompativel"],
  );
  assert.deepEqual((await enviar({ ...resposta, id: "pub-sem-versao", publicacaoId: "" })).recusadas, [
    "pub-sem-versao",
  ]);
  const outra = await professor.criar(sessaoProfessor, eu, dados);
  await assert.rejects(
    banco.$executeRaw`UPDATE jogada SET atividade_id = ${outra.id} WHERE id = ${resposta.id}`,
    /foreign key|23503/i,
  );
  assert.deepEqual(
    (await enviar({ ...resposta, id: "pub-versao-outra-atividade", atividadeId: outra.id, missaoId: outra.id }))
      .recusadas,
    ["pub-versao-outra-atividade"],
  );
  assert.deepEqual(
    (
      await aluno.jogadas(sessao, {
        jogadas: [{ ...resposta, id: "pub-legado-burla", publicacaoId: segunda.publicacaoId }],
      })
    ).recebidas,
    [],
  );
  const inicio = { atividadeId: criada.id, publicacaoId: segunda.publicacaoId, iniciadaEm: new Date().toISOString() };
  const inicioResposta = await sincronizacao.sincronizar(sessao, {
    dispositivoId: "pub-dispositivo",
    jogadas: [],
    compras: [],
    inicios: [inicio],
  });
  assert.deepEqual(inicioResposta.iniciosConfirmados, [segunda.publicacaoId]);
  await banco.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET LOCAL ROLE modolume_api");
    await tx.atividadePublicacao.update({ where: { id: original.id }, data: { prazo: amanha } });
  });
  await assert.rejects(
    banco.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE modolume_api");
      await tx.atividadePublicacao.update({ where: { id: original.id }, data: { conteudo: {} } });
    }),
    /permission denied/,
  );
  await professor.excluir(sessaoProfessor, eu, criada.id);
  assert.equal(await banco.atividadePublicacao.count({ where: { atividadeId: criada.id } }), 2);
  assert.deepEqual((await enviar({ ...resposta, id: "pub-offline-apos-arquivar" })).recebidas, [
    "pub-offline-apos-arquivar",
  ]);
  console.log(
    "OK: publicação concorrente única, conteúdo imutável, prazo editável, entrega offline vinculada à versão, recusa de burla e arquivo preservado",
  );
}
