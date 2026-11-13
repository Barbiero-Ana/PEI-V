import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, it } from "node:test";
import { Module, type INestApplication } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { NestFactory } from "@nestjs/core";
import { Banco } from "./infra.js";
import { ControladorSincronizacaoAluno } from "./sincronizacao-aluno.js";
import { ControladorAvisosAluno } from "./avisos-aluno.js";
import { ControladorAvaliacoes } from "./avaliacoes.js";

let turma = "turma-atual";
let versao = 1;
let chamadasDeNegocio = 0;
const negocio = () => {
  chamadasDeNegocio++;
  throw new Error("Operação não deveria ter passado pela guarda");
};
const banco = {
  aluno: { findUnique: async () => ({ ativo: true, versaoAcesso: versao, turmaId: turma, turma: { ativa: true } }) },
  professor: {
    findUnique: async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      nome: "Equipe",
      papel: where.id,
      ativo: true,
      instituicaoId: "escola",
      versaoAcesso: versao,
      senhaProvisoria: false,
    }),
  },
  $transaction: negocio,
  atividadeProfessor: { findMany: negocio },
  avaliacaoAtividade: { findMany: negocio },
};
@Module({
  imports: [JwtModule.register({ global: true, secret: "somente-testes-das-rotas-novas" })],
  controllers: [ControladorSincronizacaoAluno, ControladorAvisosAluno, ControladorAvaliacoes],
  providers: [{ provide: Banco, useValue: banco }],
})
class ModuloTeste {}
let app: INestApplication;
let origem: string;
let jwt: JwtService;
before(async () => {
  app = await NestFactory.create(ModuloTeste, { logger: false });
  await app.listen(0, "127.0.0.1");
  origem = await app.getUrl();
  jwt = app.get(JwtService);
});
after(async () => {
  await app?.close();
});
const rotas = [
  ["POST", "/aluno/sincronizar"],
  ["GET", "/aluno/avisos"],
  ["POST", "/aluno/avisos/lidos"],
  ["GET", "/aluno/avaliacoes"],
  ["GET", "/professor/atividades/a/alunos/b"],
  ["POST", "/professor/atividades/a/alunos/b/avaliacoes"],
  ["GET", "/professor/alunos/b/avaliacoes"],
  ["GET", "/professor/avaliacoes/pendentes"],
] as const;
const chamar = (metodo: string, caminho: string, token?: string) =>
  fetch(`${origem}${caminho}`, { method: metodo, headers: token ? { Authorization: `Bearer ${token}` } : {} });
it("as novas rotas exigem sessão e o papel correto antes de consultar ou escrever dados", async () => {
  for (const [metodo, caminho] of rotas) {
    assert.equal((await chamar(metodo, caminho)).status, 401);
    const aluno = caminho.startsWith("/aluno");
    const token = jwt.sign(
      aluno ? { sub: "professor", papel: "professor", v: 1 } : { sub: "aluno", papel: "aluno", v: 1, turmaId: turma },
    );
    assert.equal((await chamar(metodo, caminho, token)).status, 403);
  }
  assert.equal(chamadasDeNegocio, 0);
});
it("transferência, revogação e mudança de papel bloqueiam também sincronização e avisos", async () => {
  const aluno = jwt.sign({ sub: "aluno", papel: "aluno", v: 1, turmaId: turma });
  const professor = jwt.sign({ sub: "professor", papel: "professor", v: 1 });
  turma = "outra-turma";
  for (const [metodo, caminho] of rotas.filter(([, c]) => c.startsWith("/aluno")))
    assert.equal((await chamar(metodo, caminho, aluno)).status, 401);
  versao = 2;
  for (const [metodo, caminho] of rotas)
    assert.equal((await chamar(metodo, caminho, caminho.startsWith("/aluno") ? aluno : professor)).status, 401);
  assert.equal(chamadasDeNegocio, 0);
});
