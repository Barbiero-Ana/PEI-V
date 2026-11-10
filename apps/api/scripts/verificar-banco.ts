import "reflect-metadata";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { Banco, hojeBrasil } from "../src/infra.js";
import { ControladorAcesso } from "../src/acesso.js";
import { ControladorAdministracao } from "../src/admin.js";
import { ControladorAluno } from "../src/aluno.js";
import { ControladorProfessor } from "../src/professor.js";
import { resumoDoSegredo } from "../src/credencial.js";
import { JwtService } from "@nestjs/jwt";

// Banco isolado, nunca usa DATABASE_URL do ambiente ou .env. Mantém arquivos para inspeção.
const diretorioTemporario = resolve(import.meta.dirname, "../../../tmp");
mkdirSync(diretorioTemporario, { recursive: true });
const pasta = mkdtempSync(resolve(diretorioTemporario, "auditoria-banco-"));
const porta = Number(process.env.PORTA_TESTE_BANCO ?? 55439);
const servidor = new EmbeddedPostgres({
  databaseDir: pasta,
  port: porta,
  user: "postgres",
  password: "teste-local",
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});
await servidor.initialise();
await servidor.start();
const cliente = servidor.getPgClient("postgres");
const banco = new Banco({
  datasources: { db: { url: `postgresql://postgres:teste-local@127.0.0.1:${porta}/postgres` } },
});
try {
  await cliente.connect();
  const migracoes = resolve(import.meta.dirname, "../prisma/migrations");
  const nomes = readdirSync(migracoes)
    .filter((nome) => /^\d/.test(nome))
    .sort();
  const sqlDaMigracao = (nome: string) => readFileSync(resolve(migracoes, nome, "migration.sql"), "utf8");
  for (const nome of nomes.filter((nome) => nome < "20261108")) await cliente.query(sqlDaMigracao(nome));
  await cliente.query("INSERT INTO registro (acao) VALUES ('legado')");
  await cliente.query(`
    INSERT INTO instituicao (id, nome) VALUES ('legado', 'Escola legada');
    INSERT INTO turma (id, instituicao_id, nome, serie, periodo, ano_letivo, codigo)
      VALUES ('turma-legada', 'legado', 'Turma legada', '6º ano', 'manhã', 2026, 'LEGADO');
    INSERT INTO aluno (id, turma_id, nome, matricula, codigo_acesso)
      VALUES ('aluno-legado', 'turma-legada', 'Aluno legado', '1', 'GACY2345');
    INSERT INTO mapa (numero, titulo, constelacao) VALUES (2, 'Mapa legado', 'legado');
    INSERT INTO pontos_mapa (aluno_id, mapa_numero, pontos) VALUES ('aluno-legado', 2, 18);
  `);
  await cliente.query(
    readFileSync(resolve(migracoes, "../sql/papel-da-api.sql"), "utf8").replace(":'senha'", "'somente-teste-local'"),
  );
  // Reproduz a concessão incorreta de uma instalação antiga antes de migrar.
  await cliente.query("GRANT UPDATE, DELETE, TRUNCATE ON TABLE registro TO modolume_api");
  for (const nome of nomes.filter((nome) => nome >= "20261108")) await cliente.query(sqlDaMigracao(nome));
  assert.equal(
    (
      await banco.pontoMapa.findUniqueOrThrow({
        where: { alunoId_mapaNumero: { alunoId: "aluno-legado", mapaNumero: 2 } },
      })
    ).pontos,
    18,
  );
  await cliente.query("SET ROLE modolume_api");
  await cliente.query("INSERT INTO registro (acao) VALUES ('teste')");
  for (const sql of ["UPDATE registro SET acao = 'alterada'", "DELETE FROM registro", "TRUNCATE registro"])
    await assert.rejects(cliente.query(sql), /permission denied/);
  assert.equal((await cliente.query("SELECT * FROM registro")).rowCount, 2);
  await cliente.query("RESET ROLE");
  console.log("OK: migrações e auditoria somente de acréscimo");

  await servidor.createDatabase("papel_primeiro");
  const outraBase = servidor.getPgClient("papel_primeiro");
  await outraBase.connect();
  try {
    await outraBase.query("GRANT USAGE ON SCHEMA public TO modolume_api");
    for (const nome of nomes) await outraBase.query(sqlDaMigracao(nome));
    await outraBase.query("SET ROLE modolume_api");
    await outraBase.query("INSERT INTO registro (acao) VALUES ('teste')");
    for (const sql of ["UPDATE registro SET acao = 'alterada'", "DELETE FROM registro", "TRUNCATE registro"])
      await assert.rejects(outraBase.query(sql), /permission denied/);
  } finally {
    await outraBase.end();
  }
  console.log("OK: auditoria protegida quando o papel existe antes das migrações");

  await banco.instituicao.create({ data: { id: "escola", nome: "Escola de teste" } });
  await banco.materia.create({
    data: { id: "matematica", instituicaoId: "escola", nome: "Matemática", chave: "matematica" },
  });
  const eu = { id: "admin", nome: "Admin", papel: "admin" as const, instituicaoId: "escola" };
  const administrador = new ControladorAdministracao(banco);
  const criada = await administrador.criarUsuario(eu, {
    nome: "Pessoa",
    email: "teste@example.test",
    papel: "professor",
    materiaId: "matematica",
  });
  assert.deepEqual(Object.keys(criada), ["id"]);
  const acesso = new ControladorAcesso(banco, new JwtService({ secret: "segredo-de-teste" }));
  process.env.RESEND_API_KEY = "teste-local-sem-envio";
  process.env.EMAIL_REMETENTE = "teste@example.test";
  process.env.WEB_URL = "https://example.test";
  const buscarOriginal = globalThis.fetch;
  const entregas: string[] = [];
  globalThis.fetch = async (endereco, opcoes) => {
    assert.equal(String(endereco), "https://api.resend.com/emails");
    const dados = JSON.parse(String(opcoes?.body));
    assert.deepEqual(dados.to, ["teste@example.test"]);
    const link = dados.text.match(/https:\/\/example\.test\/redefinir-senha#[a-f0-9]+/)?.[0];
    assert.ok(link);
    entregas.push(new URL(link).hash.slice(1));
    return new Response("{}", { status: 200 });
  };
  try {
    const existente = await acesso.recuperarSenha({ email: "teste@example.test" });
    const inexistente = await acesso.recuperarSenha({ email: "ausente@example.test" });
    assert.deepEqual(existente, inexistente);
    assert.equal(entregas.length, 1);
    const pessoa = await banco.professor.findUniqueOrThrow({ where: { id: criada.id } });
    assert.equal(pessoa.redefinicaoHash, resumoDoSegredo(entregas[0]!));
    await banco.professor.update({ where: { id: criada.id }, data: { redefinicaoExpiraEm: new Date(0) } });
    await assert.rejects(acesso.redefinirSenha({ token: entregas[0], nova: "NovaSenha123" }), /expirado/);
    await acesso.recuperarSenha({ email: "teste@example.test" });
  } finally {
    globalThis.fetch = buscarOriginal;
  }
  const segredo = entregas.at(-1)!;
  const resultados = await Promise.allSettled(
    [1, 2].map(() => acesso.redefinirSenha({ token: segredo, nova: "NovaSenha123" })),
  );
  assert.equal(resultados.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await banco.professor.findUniqueOrThrow({ where: { id: criada.id } })).versaoAcesso, 2);
  console.log("OK: contrato Resend simulado, resposta uniforme, validade, uso único concorrente e versão da sessão");

  await banco.turma.create({
    data: {
      id: "turma",
      nome: "Turma",
      serie: "6º ano",
      anoLetivo: 2026,
      periodo: "manha",
      codigo: "TURMA1",
      instituicaoId: eu.instituicaoId,
    },
  });
  await banco.aluno.create({
    data: { id: "aluno", nome: "Aluno", matricula: "1", turmaId: "turma", codigoAcesso: "TESTE234" },
  });
  const codigo = "TESTE234";
  const pins = ["2749", "3861"];
  const entradas = await Promise.allSettled(pins.map((pin) => acesso.entrarAluno({ codigo, pin })));
  assert.equal(entradas.filter((entrada) => entrada.status === "fulfilled").length, 1);
  const pinVencedor = pins[entradas.findIndex((entrada) => entrada.status === "fulfilled")]!;
  await acesso.entrarAluno({ codigo, pin: pinVencedor });
  const errados = await Promise.allSettled(
    ["1549", "2876", "4639", "5479", "7351"].map((pin) => acesso.entrarAluno({ codigo, pin })),
  );
  assert.ok(errados.every((entrada) => entrada.status === "rejected" && entrada.reason.getStatus() === 401));
  await assert.rejects(acesso.entrarAluno({ codigo, pin: pinVencedor }), { status: 429 });
  console.log("OK: PIN inicial único e bloqueio após cinco tentativas concorrentes");
  await banco.formatoAtividade.create({ data: { id: "objetiva", rotulo: "Objetiva" } });
  await banco.mapa.create({ data: { numero: 1, titulo: "Mapa", constelacao: "teste" } });
  await banco.missao.create({
    data: { id: "missao", mapaNumero: 1, formatoId: "objetiva", titulo: "Missão", conteudo: "Matemática", ordem: 0 },
  });
  const aluno = new ControladorAluno(banco);
  const sessao = { sub: "aluno", papel: "aluno" as const, turmaId: "turma" };
  const jogada = {
    id: "jogada-teste",
    origem: "mapa",
    missaoId: "missao",
    titulo: "Missão",
    formato: "objetiva",
    rodadas: 2,
    acertosDePrimeira: 2,
    tentativas: 2,
    percentualConclusao: 100,
    percentualAcerto: 100,
    tempoSegundos: 15,
    estrelas: 3,
    data: "2026-11-08",
  };
  const invalida = { ...jogada, id: "jogada-indevida", origem: "professor", atividadeId: "atividade-de-outra-turma" };
  assert.deepEqual(await aluno.jogadas(sessao, { jogadas: [invalida, jogada] }), {
    recebidas: [jogada.id],
    recusadas: [invalida.id],
  });
  assert.deepEqual(await aluno.jogadas(sessao, { jogadas: [jogada] }), { recebidas: [jogada.id], recusadas: [] });
  assert.equal(await banco.jogada.count(), 1);
  console.log("OK: lote misto recusa vínculo inválido e reenvio de jogada não duplica histórico");

  await Promise.all(
    [42, 7, 19].map((pontos) =>
      aluno.gravarProgresso(sessao, {
        progresso: { missao: { estrelas: 1, jogadas: pontos, melhorAcerto: 50 } },
        pontosPorNivel: { "1": pontos },
        constelacoes: {},
        desafios: {},
        gastos: 0,
        compras: [],
      }),
    ),
  );
  const progressoConsolidado = await aluno.lerProgresso(sessao);
  assert.equal(progressoConsolidado.progresso.missao?.jogadas, 42);
  assert.equal(progressoConsolidado.pontosPorNivel["1"], 42);
  console.log("OK: envio concorrente de retratos preserva o maior total");

  await banco.professorTurma.create({ data: { professorId: criada.id, turmaId: "turma" } });
  const professor = new ControladorProfessor(banco);
  const equipe = { id: criada.id, nome: "Pessoa", papel: "professor" as const, instituicaoId: eu.instituicaoId };
  const sessaoProfessor = { sub: equipe.id, papel: equipe.papel };
  const feedbackErro = "Conte todos os lados do triângulo e tente novamente.";
  const atividade = await professor.criar(sessaoProfessor, equipe, {
    titulo: "Geometria de teste",
    formato: "objetiva",
    instrucao: "Escolha a alternativa correta.",
    habilidade: "",
    missaoId: "",
    planoId: "",
    questoes: [
      {
        tipo: "objetiva",
        enunciado: "Quantos lados tem um triângulo?",
        alternativas: ["3", "4"],
        correta: 0,
        feedbackErro,
      },
    ],
    turmas: ["turma"],
    liberarEm: hojeBrasil(),
  });
  const resposta = {
    ...jogada,
    id: "resposta-atividade",
    origem: "professor",
    missaoId: atividade.id,
    atividadeId: atividade.id,
    titulo: atividade.titulo,
  };
  assert.equal((await aluno.atividades(sessao)).atividades.length, 0);
  await professor.mudarEnvio(sessaoProfessor, equipe, atividade.id, { enviar: true });
  const publicada = (await aluno.atividades(sessao)).atividades[0];
  assert.equal(publicada?.id, atividade.id);
  assert.equal(publicada?.questoes[0]?.feedbackErro, feedbackErro);
  assert.deepEqual((await aluno.jogadas(sessao, { jogadas: [resposta] })).recebidas, [resposta.id]);
  assert.deepEqual((await aluno.jogadas(sessao, { jogadas: [resposta] })).recebidas, [resposta.id]);
  assert.equal(await banco.jogada.count({ where: { atividadeId: atividade.id } }), 1);
  const situacao = await professor.situacao(sessaoProfessor, equipe, atividade.id);
  assert.equal(situacao.alunos[0]?.id, sessao.sub);
  assert.equal(situacao.alunos[0]?.acerto, 100);
  assert.equal(situacao.alunos[0]?.concluiu, true);
  console.log("OK: professor publica, aluno recebe feedback e envia uma vez, professor consulta o resultado");

  await cliente.query(
    `CREATE FUNCTION recusar_registro_teste() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'falha deliberada'; END $$; CREATE TRIGGER recusar_registro_teste BEFORE INSERT ON registro FOR EACH ROW EXECUTE FUNCTION recusar_registro_teste();`,
  );
  const antes = await banco.professor.findUniqueOrThrow({ where: { id: criada.id } });
  await assert.rejects(administrador.novaSenha(eu, criada.id), /falha deliberada/);
  assert.deepEqual(await banco.professor.findUniqueOrThrow({ where: { id: criada.id } }), antes);
  console.log("OK: falha da auditoria reverte revogação da credencial");
} finally {
  await banco.$disconnect();
  await cliente.end();
  await servidor.stop();
}
