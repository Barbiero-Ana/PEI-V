import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MISSOES, NIVEIS, creditarJogada, progressoVazio } from "@modolume/core";
import { Banco, hojeBrasil, type Equipe } from "../src/infra.js";
import { ControladorSincronizacaoAluno } from "../src/sincronizacao-aluno.js";
import { ControladorAluno } from "../src/aluno.js";
import { ControladorProfessor } from "../src/professor.js";
import { ControladorAvaliacoes } from "../src/avaliacoes.js";
import { ControladorAvisosAluno } from "../src/avisos-aluno.js";

/** Executado somente pelo verificador que cria seu próprio PostgreSQL descartável. */
export async function verificarConsolidacao(banco: Banco, eu: Equipe) {
  const sincronizacao = new ControladorSincronizacaoAluno(banco);
  const aluno = new ControladorAluno(banco);
  const professor = new ControladorProfessor(banco);
  const avaliacoes = new ControladorAvaliacoes(banco);
  const avisos = new ControladorAvisosAluno(banco);
  const hoje = hojeBrasil();
  const nivel = NIVEIS[0]!;
  await banco.mapa.update({ where: { numero: nivel.numero }, data: { constelacao: nivel.constelacao } });
  for (const m of MISSOES.filter((m) => nivel.missoes.includes(m.id))) {
    await banco.formatoAtividade.upsert({
      where: { id: m.formato },
      create: { id: m.formato, rotulo: m.formato },
      update: {},
    });
    await banco.missao.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        mapaNumero: nivel.numero,
        formatoId: m.formato,
        titulo: m.titulo,
        conteudo: m.conteudo,
        ordem: nivel.missoes.indexOf(m.id) + 10,
      },
      update: {},
    });
  }
  await banco.turma.create({
    data: {
      id: "turma-consolidacao",
      instituicaoId: eu.instituicaoId,
      nome: "Teste de consolidação",
      serie: "6º ano",
      periodo: "manha",
      anoLetivo: 2026,
      codigo: "CONS26",
      professores: { create: { professorId: eu.id } },
    },
  });
  for (const [id, codigo, saldo] of [
    ["conc-a", "CNSA2345", 100],
    ["conc-b", "CNSB2345", 100],
    ["conc-c", "CNSC2345", 10],
  ] as const) {
    await banco.aluno.create({
      data: { id, nome: id, matricula: id, turmaId: "turma-consolidacao", codigoAcesso: codigo },
    });
    await banco.pontoMapa.create({ data: { alunoId: id, mapaNumero: nivel.numero, pontos: saldo } });
  }
  const sessao = (sub: string) => ({ sub, papel: "aluno" as const, turmaId: "turma-consolidacao", v: 1 });
  const m = MISSOES.find((m) => m.id === nivel.missoes[0])!;
  const jogada = (id: string) => ({
    id,
    recompensar: true,
    origem: "mapa" as const,
    missaoId: m.id,
    formato: m.formato,
    titulo: m.titulo,
    rodadas: 2,
    acertosDePrimeira: 2,
    tentativas: 2,
    percentualConclusao: 100,
    percentualAcerto: 100,
    estrelas: 3 as const,
    tempoSegundos: 20,
    dicas: 0,
    data: hoje,
  });
  const pedido = (dispositivoId: string, id: string, compras: string[] = []) => ({
    dispositivoId,
    jogadas: [jogada(id)],
    compras,
  });
  await Promise.all([
    sincronizacao.sincronizar(sessao("conc-a"), pedido("aparelho-a", "credito-a-1", ["acessorio:clownNose"])),
    sincronizacao.sincronizar(sessao("conc-a"), pedido("aparelho-b", "credito-a-2", ["acessorio:sleepMask"])),
  ]);
  const a = await aluno.lerProgresso(sessao("conc-a"));
  const inicial = { ...progressoVazio(), pontosPorNivel: { [nivel.numero]: 100 } };
  const esperado = creditarJogada(creditarJogada(inicial, jogada("credito-a-1")), jogada("credito-a-2"));
  assert.deepEqual(a.pontosPorNivel, esperado.pontosPorNivel);
  assert.equal(a.progresso[m.id]?.jogadas, 2);
  assert.equal(a.gastos, 18);
  assert.equal(a.compras.length, 2);
  // Reenvio da mesma operação e compra já confirmada não adiciona nem desconta outra vez.
  await sincronizacao.sincronizar(sessao("conc-a"), pedido("aparelho-a", "credito-a-1", ["acessorio:clownNose"]));
  assert.equal((await aluno.lerProgresso(sessao("conc-a"))).gastos, 18);
  await sincronizacao.sincronizar(sessao("conc-b"), pedido("aparelho-b", "credito-b-2", ["acessorio:sleepMask"]));
  await sincronizacao.sincronizar(sessao("conc-b"), pedido("aparelho-a", "credito-b-1", ["acessorio:clownNose"]));
  const b = await aluno.lerProgresso(sessao("conc-b"));
  assert.deepEqual(b.pontosPorNivel, a.pontosPorNivel);
  assert.equal(b.gastos, a.gastos);
  assert.deepEqual([...b.compras].sort(), [...a.compras].sort());
  const colisao = await sincronizacao.sincronizar(sessao("conc-b"), pedido("aparelho-a", "credito-a-1"));
  assert.deepEqual(colisao.recebidas, []);
  assert.deepEqual(colisao.recusadas, ["credito-a-1"]);
  await assert.rejects(aluno.gravarProgresso(sessao("conc-a"), a), { status: 409 });
  const concorrentes = await Promise.all([
    sincronizacao.sincronizar(sessao("conc-c"), {
      dispositivoId: "aparelho-a",
      jogadas: [],
      compras: ["acessorio:clownNose"],
    }),
    sincronizacao.sincronizar(sessao("conc-c"), {
      dispositivoId: "aparelho-b",
      jogadas: [],
      compras: ["acessorio:sleepMask"],
    }),
  ]);
  assert.equal(concorrentes.flatMap((c) => c.comprasConfirmadas).length, 1);
  assert.equal(concorrentes.flatMap((c) => c.comprasRecusadas).length, 1);
  const c = await aluno.lerProgresso(sessao("conc-c"));
  assert.ok(c.gastos <= 10);
  assert.equal(c.compras.length, 1);
  const legado = { ...progressoVazio(), pontosPorNivel: { [nivel.numero]: 200 }, compras: [], gastos: 0 };
  await sincronizacao.sincronizar(sessao("conc-c"), {
    dispositivoId: "aparelho-legado",
    legado,
    jogadas: [],
    compras: [],
  });
  await sincronizacao.sincronizar(sessao("conc-c"), {
    dispositivoId: "aparelho-legado",
    legado: { ...legado, pontosPorNivel: { [nivel.numero]: 9999 } },
    jogadas: [],
    compras: [],
  });
  assert.equal((await aluno.lerProgresso(sessao("conc-c"))).pontosPorNivel[nivel.numero], 200);
  console.log("OK: soma entre aparelhos, reenvio, colisão, compras concorrentes, saldo e importação legada única");

  // Falha durante o débito desfaz também o histórico e o crédito da mesma transação.
  await banco.$executeRawUnsafe(
    "CREATE FUNCTION falhar_compra_teste() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.item_id = 'capa-neve' THEN RAISE EXCEPTION 'compra recusada no teste'; END IF; RETURN NEW; END $$",
  );
  await banco.$executeRawUnsafe(
    "CREATE TRIGGER falhar_compra_teste BEFORE INSERT ON compra_loja FOR EACH ROW EXECUTE FUNCTION falhar_compra_teste()",
  );
  const antes = await aluno.lerProgresso(sessao("conc-a"));
  await assert.rejects(
    sincronizacao.sincronizar(sessao("conc-a"), pedido("aparelho-a", "credito-rollback", ["capa-neve"])),
    /compra recusada/,
  );
  assert.equal(await banco.jogada.count({ where: { id: "credito-rollback" } }), 0);
  assert.deepEqual(await aluno.lerProgresso(sessao("conc-a")), antes);
  await banco.$executeRawUnsafe("DROP TRIGGER falhar_compra_teste ON compra_loja");
  await banco.$executeRawUnsafe("DROP FUNCTION falhar_compra_teste()");
  console.log("OK: falha no débito reverte jogada e recompensa");

  const amanha = new Date(`${hoje}T00:00:00Z`);
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const atividade = await professor.criar({ sub: eu.id, papel: "professor" }, eu, {
    titulo: "Atividade com prazo",
    formato: "objetiva",
    instrucao: "Escolha uma alternativa",
    habilidade: "",
    missaoId: "",
    planoId: "",
    turmas: ["turma-consolidacao"],
    liberarEm: hoje,
    prazo: amanha.toISOString().slice(0, 10),
    questoes: [
      {
        tipo: "objetiva",
        enunciado: "Qual é o dobro de dois?",
        alternativas: ["4", "3"],
        correta: 0,
        feedbackErro: "Some dois mais dois e tente novamente.",
      },
    ],
  });
  assert.equal((await avisos.listar(sessao("conc-a"))).avisos.length, 0);
  const publicacao = await professor.mudarEnvio({ sub: eu.id, papel: "professor" }, eu, atividade.id, { enviar: true });
  assert.ok((await avisos.listar(sessao("conc-a"))).avisos.some((a) => a.tipo === "prazo"));
  await sincronizacao.sincronizar(sessao("conc-a"), {
    dispositivoId: "aparelho-a",
    jogadas: [],
    compras: [],
    inicios: [
      { atividadeId: atividade.id, publicacaoId: publicacao.publicacaoId, iniciadaEm: new Date().toISOString() },
    ],
  });
  assert.equal(
    (await professor.situacao({ sub: eu.id, papel: "professor" }, eu, atividade.id)).alunos.find(
      (a) => a.id === "conc-a",
    )?.situacao,
    "em andamento",
  );
  const resposta = {
    ...jogada("resposta-consolidacao"),
    recompensar: false,
    origem: "professor",
    atividadeId: atividade.id,
    publicacaoId: publicacao.publicacaoId,
    missaoId: atividade.id,
    formato: "objetiva",
    rodadas: 1,
    acertosDePrimeira: 1,
    tentativas: 1,
    fases: [{ ordem: 1, tentativas: 1, tempoSegundos: 12, dica: false }],
  };
  const enviada = await sincronizacao.sincronizar(sessao("conc-a"), {
    dispositivoId: "aparelho-a",
    jogadas: [resposta],
    compras: [],
  });
  assert.deepEqual(enviada.recebidas, [resposta.id]);
  assert.equal((await avaliacoes.pendentes(eu)).find((a) => a.id === atividade.id)?.quantidade, 1);
  const detalhe = await avaliacoes.detalhe(eu, atividade.id, "conc-a");
  assert.deepEqual(detalhe.jogadas[0]?.fases, resposta.fases);
  const rascunho = {
    id: randomUUID(),
    jogadaId: resposta.id,
    feedback: "Confira a operação inversa para verificar sua resposta.",
    publicar: false,
  };
  await avaliacoes.salvar(eu, atividade.id, "conc-a", rascunho);
  assert.equal((await avisos.avaliacoes(sessao("conc-a"))).avaliacoes.length, 0);
  await assert.rejects(
    avaliacoes.salvar(eu, atividade.id, "conc-a", { ...rascunho, id: randomUUID(), feedback: " ", publicar: true }),
    { status: 400 },
  );
  const publicada = { ...rascunho, id: randomUUID(), publicar: true };
  await avaliacoes.salvar(eu, atividade.id, "conc-a", publicada);
  await avaliacoes.salvar(eu, atividade.id, "conc-a", publicada);
  assert.equal((await avaliacoes.historico(eu, "conc-a")).length, 2);
  assert.equal((await avisos.avaliacoes(sessao("conc-a"))).avaliacoes.length, 1);
  assert.equal(
    (await avaliacoes.pendentes(eu)).find((a) => a.id === atividade.id),
    undefined,
  );
  assert.equal((await avisos.avaliacoes(sessao("conc-b"))).avaliacoes.length, 0);
  await assert.rejects(avaliacoes.detalhe({ ...eu, id: "professor-sem-vinculo" }, atividade.id, "conc-a"), {
    status: 404,
  });
  await assert.rejects(avaliacoes.salvar(eu, atividade.id, "conc-b", { ...publicada, id: randomUUID() }), {
    status: 404,
  });
  const lista = (await avisos.listar(sessao("conc-a"))).avisos;
  const aviso = lista.find((a) => a.avaliacaoId === publicada.id)!;
  assert.equal(aviso.lida, false);
  await avisos.ler(sessao("conc-a"), { ids: lista.map((a) => a.id) });
  assert.ok((await avisos.listar(sessao("conc-a"))).avisos.every((a) => a.lida));
  assert.ok((await avisos.listar(sessao("conc-b"))).avisos.some((a) => !a.lida));
  console.log("OK: início, detalhe por fase, rascunho privado, publicação, histórico e avisos lidos por aluno");

  await banco.atividadeProfessor.update({
    where: { id: atividade.id },
    data: { titulo: "Título atualizado após a avaliação" },
  });
  assert.equal((await avisos.avaliacoes(sessao("conc-a"))).avaliacoes[0]?.atividade.titulo, "Atividade com prazo");

  const ontem = new Date(`${hoje}T00:00:00Z`);
  ontem.setUTCDate(ontem.getUTCDate() - 1);
  await banco.atividadeProfessor.update({ where: { id: atividade.id }, data: { liberarEm: ontem, prazo: ontem } });
  await banco.atividadePublicacao.update({
    where: { id: publicacao.publicacaoId! },
    data: { liberarEm: ontem, prazo: ontem },
  });
  assert.equal(
    (await aluno.atividades(sessao("conc-a"))).atividades.find((a) => a.id === atividade.id)?.encerrada,
    true,
  );
  const tardia = await sincronizacao.sincronizar(sessao("conc-a"), {
    dispositivoId: "aparelho-a",
    compras: [],
    jogadas: [{ ...resposta, id: "resposta-apos-prazo" }],
  });
  assert.deepEqual(tardia.recusadas, ["resposta-apos-prazo"]);
  // Um reenvio de resultado já confirmado continua idempotente mesmo após o encerramento.
  const repetida = await sincronizacao.sincronizar(sessao("conc-a"), {
    dispositivoId: "aparelho-a",
    compras: [],
    jogadas: [resposta],
  });
  assert.deepEqual(repetida.recebidas, [resposta.id]);
  await professor.excluir({ sub: eu.id, papel: "professor" }, eu, atividade.id);
  assert.equal((await avisos.avaliacoes(sessao("conc-a"))).avaliacoes.length, 1);
  assert.equal((await aluno.atividades(sessao("conc-a"))).atividades.length, 0);
  await assert.rejects(
    banco.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE modolume_api");
      await tx.avaliacaoAtividade.update({ where: { id: publicada.id }, data: { feedback: "apagada" } });
    }),
    /permission denied/,
  );
  console.log("OK: prazo, reenvio após encerramento, exclusão preservando avaliações e versões imutáveis no banco");
}
