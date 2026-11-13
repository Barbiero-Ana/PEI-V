import { randomUUID } from "node:crypto";
import {
  Catch,
  Controller,
  Get,
  HttpException,
  Inject,
  ServiceUnavailableException,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { Banco } from "./infra.js";

/** Não registra corpo, query, token, identificador de aluno ou mensagem bruta da exceção. */
export function rastrearRequisicao(req: Request, res: Response, proximo: NextFunction) {
  const id = randomUUID(),
    inicio = Date.now();
  res.locals.requisicaoId = id;
  res.setHeader("X-Request-ID", id);
  res.once("finish", () => {
    const rota = typeof req.route?.path === "string" ? req.route.path : "rota-nao-identificada";
    console.log(
      JSON.stringify({
        evento: "api.requisicao",
        requisicaoId: id,
        metodo: req.method,
        rota,
        status: res.statusCode,
        duracaoMs: Date.now() - inicio,
      }),
    );
  });
  proximo();
}

@Catch()
export class FiltroErroSeguro implements ExceptionFilter {
  catch(erro: unknown, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse<Response>();
    const id = resposta.locals.requisicaoId;
    if (erro instanceof HttpException) {
      const corpo = erro.getResponse();
      return resposta
        .status(erro.getStatus())
        .json(typeof corpo === "string" ? { statusCode: erro.getStatus(), message: corpo } : corpo);
    }
    console.error(JSON.stringify({ evento: "api.falha", requisicaoId: id, status: 500 }));
    return resposta
      .status(500)
      .json({ statusCode: 500, message: "Não foi possível concluir a operação. Tente novamente.", requisicaoId: id });
  }
}

@Controller()
export class ControladorProntidao {
  constructor(@Inject(Banco) private readonly banco: Banco) {}
  @Get("prontidao")
  async prontidao() {
    try {
      await this.banco.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException("Serviço temporariamente indisponível.");
    }
    return {
      ok: true,
      servico: "modolume-api",
      ambiente:
        process.env.RAILWAY_ENVIRONMENT_NAME === "homologacao" && process.env.AMBIENTE_DADOS_FICTICIOS === "true"
          ? "homologacao"
          : "producao",
    };
  }
}
