import "reflect-metadata";
import { Module } from "@nestjs/common";
import { APP_GUARD, NestFactory } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AcessoController } from "./acesso.js";
import { AlunoController } from "./aluno.js";
import { Banco } from "./infra.js";
import { AdminController } from "./admin.js";
import { CoordenacaoController } from "./coordenacao.js";
import { ProfessorController } from "./professor.js";

/**
 * API do Modolume (ADR 0007 e 0015): liga o app do aluno ao painel do
 * professor. O app envia jogadas e avatar e recebe as atividades do professor;
 * o painel lê turmas, alunos e jogadas e monta as atividades.
 */

const segredo = process.env.JWT_SEGREDO;
if (!segredo && process.env.NODE_ENV === "production") throw new Error("Defina JWT_SEGREDO no ambiente.");

@Module({
  imports: [
    JwtModule.register({ global: true, secret: segredo ?? "dev-modolume-api-trocar-em-producao" }),
    // limite geral de requisições por minuto (as rotas de entrada têm limite menor)
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 240 }]),
  ],
  controllers: [AcessoController, AlunoController, ProfessorController, CoordenacaoController, AdminController],
  providers: [Banco, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
class ModuloApi {}

const app = await NestFactory.create<NestExpressApplication>(ModuloApi, { logger: ["error", "warn", "log"] });
// corpo das requisições limitado (avatar e lotes de jogadas cabem com folga)
app.useBodyParser("json", { limit: "512kb" });
app.getHttpAdapter().getInstance().disable("x-powered-by");
app.enableCors({
  // o app (celular) não manda Origin; o painel web, sim
  origin: (process.env.ORIGENS ?? "http://localhost:3000").split(",").map((o) => o.trim()),
});
app.enableShutdownHooks();
const porta = Number(process.env.PORTA ?? process.env.PORT ?? 3333);
// 0.0.0.0: o celular na mesma rede Wi-Fi consegue chamar a API pelo IP do computador
await app.listen(porta, "0.0.0.0");
console.log(`API do Modolume em http://localhost:${porta}`);
