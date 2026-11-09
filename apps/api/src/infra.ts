import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
  type CanActivate,
  type ExecutionContext,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { PrismaClient, type Prisma } from "@prisma/client";
import type { ZodTypeAny, output } from "zod";

/**
 * Peças comuns da API: acesso ao banco, sessão por token (JWT) e validação.
 *
 * Observação: a API roda com tsx (esbuild), que não gera os metadados de tipo
 * dos decoradores. Por isso as dependências são injetadas com @Inject(Classe)
 * explícito, e não só pelo tipo do parâmetro.
 */

@Injectable()
export class Banco extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

/** Papéis da equipe da escola (tabela professor) e o aluno. */
export type PapelEquipe = "professor" | "coordenacao" | "admin";
export type Papel = PapelEquipe | "aluno";
export interface Sessao {
  /** Id da pessoa da equipe ou do aluno. */
  sub: string;
  papel: Papel;
  /** Turma do aluno (só no token do aluno). */
  turmaId?: string;
  /** Versão de acesso do aluno: um código novo invalida os tokens antigos (ADR 0017). */
  v?: number;
}

/** Quem da equipe está chamando, conferido no banco a cada requisição. */
export interface Equipe {
  id: string;
  nome: string;
  papel: PapelEquipe;
  instituicaoId: string;
}

/** Valida o corpo da requisição com um esquema zod; erro 400 com as mensagens em português. */
export function validar<S extends ZodTypeAny>(esquema: S, dados: unknown): output<S> {
  const r = esquema.safeParse(dados);
  if (r.success) return r.data;
  throw new BadRequestException({
    mensagem: "Dados inválidos.",
    erros: r.error.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })),
  });
}

type Requisicao = { headers: Record<string, string>; sessao?: Sessao; equipe?: Equipe };

const PERMITE_SENHA_PROVISORIA = "modolume:permite-senha-provisoria";
/** Exceção explícita para consultar a própria conta e trocar a senha. */
export const PermiteSenhaProvisoria = () => SetMetadata(PERMITE_SENHA_PROVISORIA, true);

function guardaDe(...papeis: Papel[]) {
  @Injectable()
  class Guarda implements CanActivate {
    constructor(
      @Inject(JwtService) private readonly jwt: JwtService,
      @Inject(Banco) private readonly banco: Banco,
      @Inject(Reflector) private readonly reflector: Reflector,
    ) {}

    async canActivate(ctx: ExecutionContext) {
      const req = ctx.switchToHttp().getRequest<Requisicao>();
      const [tipo, token] = (req.headers.authorization ?? "").split(" ");
      if (tipo !== "Bearer" || !token) throw new UnauthorizedException("Entre de novo para continuar.");
      let sessao: Sessao;
      try {
        sessao = await this.jwt.verifyAsync<Sessao>(token);
      } catch {
        throw new UnauthorizedException("Sua sessão expirou. Entre de novo.");
      }
      if (!papeis.includes(sessao.papel)) throw new ForbiddenException("Você não tem permissão para isso.");
      if (sessao.papel === "aluno") {
        // Código novo, transferência ou desativação invalidam o acesso anterior.
        const aluno = await this.banco.aluno.findUnique({
          where: { id: sessao.sub },
          select: { ativo: true, versaoAcesso: true, turmaId: true, turma: { select: { ativa: true } } },
        });
        if (!aluno || !aluno.ativo || aluno.versaoAcesso !== sessao.v || aluno.turmaId !== sessao.turmaId)
          throw new UnauthorizedException("Seu acesso mudou. Entre de novo com o código que o professor passou.");
        if (!aluno.turma.ativa) throw new ForbiddenException("Sua turma está encerrada. Fale com a escola.");
      } else {
        // equipe: desativar a pessoa ou mudar o papel dela vale na hora, sem esperar o token vencer
        const pessoa = await this.banco.professor.findUnique({
          where: { id: sessao.sub },
          select: {
            id: true,
            nome: true,
            papel: true,
            ativo: true,
            instituicaoId: true,
            senhaProvisoria: true,
            versaoAcesso: true,
          },
        });
        if (
          !pessoa ||
          !pessoa.ativo ||
          pessoa.papel !== sessao.papel ||
          !Number.isInteger(sessao.v) ||
          pessoa.versaoAcesso !== sessao.v
        )
          throw new UnauthorizedException("Seu acesso mudou. Entre de novo.");
        if (pessoa.senhaProvisoria && !this.reflector.get<boolean>(PERMITE_SENHA_PROVISORIA, ctx.getHandler()))
          throw new ForbiddenException("Troque sua senha provisória para continuar.");
        req.equipe = { id: pessoa.id, nome: pessoa.nome, papel: pessoa.papel, instituicaoId: pessoa.instituicaoId };
      }
      req.sessao = sessao;
      return true;
    }
  }
  return Guarda;
}

/** Só professor autenticado. */
export const GuardaProfessor = guardaDe("professor");
/** Só coordenação: acompanha a escola e vincula professores às turmas. */
export const GuardaCoordenacao = guardaDe("coordenacao");
/** Só administrador: usuários, turmas, alunos, permissões e registros. */
export const GuardaAdmin = guardaDe("admin");
/** Qualquer pessoa da equipe (ex.: trocar a própria senha). */
export const GuardaEquipe = guardaDe("professor", "coordenacao", "admin");
/** Só aluno autenticado. */
export const GuardaAluno = guardaDe("aluno");

/** Quem da equipe está chamando (já conferido pela guarda). */
export const EquipeAtual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<{ equipe: Equipe }>().equipe,
);

/**
 * Grava auditoria. Em mutações sensíveis, recebe a mesma transação da escrita.
 * A falha é propagada para impedir confirmação de uma operação sem registro.
 */
export async function registrar(
  banco: Pick<Prisma.TransactionClient, "registro">,
  quem: { id?: string | null; nome?: string | null; papel?: string | null; instituicaoId?: string | null },
  acao: string,
  alvo: { tipo?: string; id?: string; detalhe?: string } = {},
) {
  await banco.registro.create({
    data: {
      instituicaoId: quem.instituicaoId ?? null,
      usuarioId: quem.id ?? null,
      usuarioNome: quem.nome ?? null,
      papel: quem.papel ?? null,
      acao,
      alvoTipo: alvo.tipo ?? null,
      alvoId: alvo.id ?? null,
      detalhe: alvo.detalhe ? alvo.detalhe.slice(0, 300) : null,
    },
  });
}

/** A sessão (quem está chamando), já verificada pela guarda. */
export const SessaoAtual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<{ sessao: Sessao }>().sessao,
);

/** Hoje no fuso de Brasília (AAAA-MM-DD), para comparar com datas de liberação. */
export const hojeBrasil = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
