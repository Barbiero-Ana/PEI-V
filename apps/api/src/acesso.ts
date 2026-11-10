import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Throttle } from "@nestjs/throttler";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { codigoAcessoValido, normalizarCodigoAcesso } from "@modolume/core";
import { pinFraco } from "./codigo-acesso.js";
import {
  senhaNova,
  gerarSegredo,
  resumoDoSegredo,
  entregarRedefinicao,
  MENSAGEM_RECUPERACAO,
  configuracaoRecuperacao,
} from "./credencial.js";
export { senhaNova } from "./credencial.js";
import {
  Banco,
  EquipeAtual,
  GuardaEquipe,
  PermiteSenhaProvisoria,
  registrar,
  validar,
  type Equipe,
  type Sessao,
} from "./infra.js";

const loginProfessor = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(160),
  senha: z.string().min(1, "Informe a senha.").max(200),
});

/** Senha da equipe: pelo menos 8 caracteres, com letra e número. */
const trocaSenha = z.object({ atual: z.string().min(1, "Informe a senha atual.").max(200), nova: senhaNova });

const codigoAluno = z
  .string()
  .max(20)
  .transform(normalizarCodigoAcesso)
  .refine(codigoAcessoValido, "Confira o código. O formato novo é BDFH-2468.");
const identificarAluno = z.object({ codigo: codigoAluno });
const entradaAluno = z.object({
  codigo: codigoAluno,
  pin: z.string().regex(/^\d{4}$/, "O PIN tem 4 números."),
});

/** PINs errados seguidos antes do bloqueio, e quanto tempo o bloqueio dura. */
const MAX_FALHAS = 5;
const BLOQUEIO_MS = 15 * 60_000;
const NAO_ACHOU = "Código não encontrado. Confira com o seu professor.";

/** Rosto do avatar guardado em colunas → objeto que o app entende. */
export const rostoDoAvatar = (a: {
  pele: number;
  cabelo: string;
  corCabelo: number;
  olhos: string;
  boca: string;
  acessorio: string;
  fundo: number;
}) => ({
  pele: a.pele,
  cabelo: a.cabelo,
  corCabelo: a.corCabelo,
  olhos: a.olhos,
  boca: a.boca,
  acessorio: a.acessorio,
  fundo: a.fundo,
});

// hash de uma senha qualquer: comparar mesmo quando o e-mail não existe evita
// revelar, pelo tempo de resposta, quais e-mails estão cadastrados
const HASH_FALSO = bcrypt.hashSync("modolume-senha-inexistente", 10);

/**
 * Entrada no sistema (MOD-AUT): professor com e-mail e senha; aluno com o
 * código pessoal (passado pelo professor ou coordenação) e um PIN de 4 números,
 * sem e-mail (MOD-AUT-009, ADR 0017). As rotas de entrada têm limite de
 * tentativas por minuto, e o PIN tem bloqueio por aluno.
 */
@Controller()
export class ControladorAcesso {
  constructor(
    @Inject(Banco) private readonly banco: Banco,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  @Get("saude")
  saude() {
    return { ok: true, servico: "modolume-api" };
  }

  /**
   * Entrada da equipe da escola (professor, coordenação ou administrador), com
   * e-mail e senha. O papel vai no token e define o que a pessoa vê no painel.
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("auth/professor")
  async entrarProfessor(@Body() corpo: unknown) {
    const { email, senha } = validar(loginProfessor, corpo);
    const pessoa = await this.banco.professor.findUnique({ where: { email } });
    const confere = await bcrypt.compare(senha, pessoa?.senhaHash ?? HASH_FALSO);
    // mesma mensagem para e-mail inexistente, senha errada ou conta desativada (RN-14, RN-16)
    if (!pessoa || !confere || !pessoa.ativo) {
      if (pessoa) {
        // tentativa numa conta que existe: fica no registro da escola (sem a senha)
        await registrar(this.banco, { ...pessoa, papel: pessoa.papel }, "login.falhou", {
          tipo: "usuario",
          id: pessoa.id,
          detalhe: pessoa.ativo ? "senha incorreta" : "conta desativada",
        });
      }
      throw new UnauthorizedException("E-mail ou senha incorretos.");
    }
    const sessao: Sessao = { sub: pessoa.id, papel: pessoa.papel, v: pessoa.versaoAcesso };
    await this.banco.$transaction(async (transacao) => {
      await transacao.professor.update({ where: { id: pessoa.id }, data: { ultimoAcesso: new Date() } });
      await registrar(transacao, pessoa, "login", { tipo: "usuario", id: pessoa.id });
    });
    return {
      token: await this.jwt.signAsync(sessao, { expiresIn: "8h" }),
      professor: {
        id: pessoa.id,
        nome: pessoa.nome,
        email: pessoa.email,
        disciplina: pessoa.disciplina ?? "",
        instituicaoId: pessoa.instituicaoId,
        papel: pessoa.papel,
        senhaProvisoria: pessoa.senhaProvisoria,
      },
    };
  }

  /** Quem está logado (cabeçalho do painel e página da conta). */
  @UseGuards(GuardaEquipe)
  @Get("auth/eu")
  @PermiteSenhaProvisoria()
  async eu(@EquipeAtual() eu: Equipe) {
    const pessoa = await this.banco.professor.findUniqueOrThrow({
      where: { id: eu.id },
      include: { instituicao: true },
    });
    return {
      id: pessoa.id,
      nome: pessoa.nome,
      email: pessoa.email,
      papel: pessoa.papel,
      disciplina: pessoa.disciplina,
      segmento: pessoa.segmento,
      senhaProvisoria: pessoa.senhaProvisoria,
      instituicao: { id: pessoa.instituicao.id, nome: pessoa.instituicao.nome },
    };
  }

  /** A pessoa da equipe troca a própria senha (obrigatório depois de uma senha provisória). */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(GuardaEquipe)
  @Post("auth/senha")
  @PermiteSenhaProvisoria()
  async trocarSenha(@EquipeAtual() eu: Equipe, @Body() corpo: unknown) {
    const { atual, nova } = validar(trocaSenha, corpo);
    const pessoa = await this.banco.professor.findUniqueOrThrow({ where: { id: eu.id } });
    if (!(await bcrypt.compare(atual, pessoa.senhaHash))) throw new BadRequestException("A senha atual não confere.");
    if (atual === nova) throw new BadRequestException("A nova senha precisa ser diferente da atual.");
    const senhaHash = await bcrypt.hash(nova, 12);
    await this.banco.$transaction(async (transacao) => {
      const alterados = await transacao.professor.updateMany({
        where: { id: eu.id, senhaHash: pessoa.senhaHash, ativo: true },
        data: {
          senhaHash,
          senhaProvisoria: false,
          versaoAcesso: { increment: 1 },
          redefinicaoHash: null,
          redefinicaoExpiraEm: null,
        },
      });
      if (alterados.count !== 1) throw new UnauthorizedException("Seu acesso mudou. Entre de novo.");
      await registrar(transacao, eu, "senha.trocada", { tipo: "usuario", id: eu.id });
    });
    return { ok: true };
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("auth/recuperar-senha")
  async recuperarSenha(@Body() corpo: unknown) {
    const { minutos } = configuracaoRecuperacao();
    const { email } = validar(z.object({ email: z.string().trim().toLowerCase().email().max(160) }), corpo);
    const pessoa = await this.banco.professor.findUnique({ where: { email } });
    if (pessoa?.ativo) {
      const segredo = gerarSegredo();
      const resumo = resumoDoSegredo(segredo);
      const alterados = await this.banco.professor.updateMany({
        where: { id: pessoa.id, email, ativo: true, versaoAcesso: pessoa.versaoAcesso },
        data: {
          redefinicaoHash: resumo,
          redefinicaoExpiraEm: new Date(Date.now() + minutos * 60_000),
        },
      });
      if (alterados.count !== 1) return { mensagem: MENSAGEM_RECUPERACAO };
      try {
        await entregarRedefinicao(pessoa.email, segredo);
      } catch {
        // Não revela existência da conta nem invalida um pedido posterior concorrente.
        await this.banco.professor.updateMany({
          where: { id: pessoa.id, redefinicaoHash: resumo },
          data: { redefinicaoHash: null, redefinicaoExpiraEm: null },
        });
        console.warn("Entrega de recuperação indisponível.");
      }
    }
    return { mensagem: MENSAGEM_RECUPERACAO };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("auth/redefinir-senha")
  async redefinirSenha(@Body() corpo: unknown) {
    const { token, nova } = validar(z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), nova: senhaNova }), corpo);
    const resumo = resumoDoSegredo(token);
    const senhaHash = await bcrypt.hash(nova, 12);
    await this.banco.$transaction(async (transacao) => {
      const pessoa = await transacao.professor.findUnique({ where: { redefinicaoHash: resumo } });
      const alterados = await transacao.professor.updateMany({
        where: {
          redefinicaoHash: resumo,
          redefinicaoExpiraEm: { gt: new Date() },
          ativo: true,
        },
        data: {
          senhaHash,
          senhaProvisoria: false,
          redefinicaoHash: null,
          redefinicaoExpiraEm: null,
          versaoAcesso: { increment: 1 },
        },
      });
      if (!pessoa || alterados.count !== 1) throw new BadRequestException("Link inválido ou expirado. Solicite outro.");
      await registrar(transacao, pessoa, "senha.redefinida", { tipo: "usuario", id: pessoa.id });
    });
    return { ok: true };
  }

  /**
   * Primeiro passo do aluno: o código pessoal. Responde só o primeiro nome (para
   * o aluno confirmar que é ele) e se ainda precisa criar o PIN.
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("auth/aluno/codigo")
  async identificarAluno(@Body() corpo: unknown) {
    const { codigo } = validar(identificarAluno, corpo);
    const aluno = await this.banco.aluno.findUnique({ where: { codigoAcesso: codigo }, include: { turma: true } });
    if (!aluno || !aluno.ativo || !aluno.turma.ativa) throw new UnauthorizedException(NAO_ACHOU);
    return {
      primeiroNome: aluno.nome.split(" ")[0],
      turma: aluno.turma.nome,
      criarPin: !aluno.pinHash,
    };
  }

  /**
   * Segundo passo: o PIN de 4 números. No primeiro acesso (ou depois que o
   * professor zera), o PIN enviado vira o PIN do aluno. Depois de 5 PINs
   * errados seguidos, o acesso fica bloqueado por 15 minutos (MOD-AUT-009).
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("auth/aluno")
  async entrarAluno(@Body() corpo: unknown) {
    const { codigo, pin } = validar(entradaAluno, corpo);
    const buscarAluno = () =>
      this.banco.aluno.findUnique({
        where: { codigoAcesso: codigo },
        include: { turma: true, avatar: true },
      });
    let pinNovo: string | undefined;
    let versaoInicial: number | undefined;
    for (let tentativa = 0; tentativa < 12; tentativa++) {
      const aluno = await buscarAluno();
      if (!aluno || !aluno.ativo || !aluno.turma.ativa) throw new UnauthorizedException(NAO_ACHOU);
      versaoInicial ??= aluno.versaoAcesso;
      if (aluno.versaoAcesso !== versaoInicial) {
        throw new UnauthorizedException("Seu acesso mudou. Entre de novo.");
      }

      const agora = new Date();
      if (aluno.bloqueadoAte && aluno.bloqueadoAte > agora) {
        const minutos = Math.ceil((aluno.bloqueadoAte.getTime() - agora.getTime()) / 60_000);
        throw new HttpException(
          `Muitas tentativas. Espere ${minutos} min ou peça ao professor para zerar o seu PIN.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (!aluno.pinHash && pinFraco(pin)) {
        throw new UnauthorizedException("Esse PIN é fácil de adivinhar. Escolha outro.");
      }
      const correto = aluno.pinHash ? await bcrypt.compare(pin, aluno.pinHash) : true;
      if (!aluno.pinHash) pinNovo ??= await bcrypt.hash(pin, 10);
      const falhas = aluno.pinFalhas + 1;
      const bloquear = falhas >= MAX_FALHAS;
      const alterados = await this.banco.aluno.updateMany({
        where: {
          id: aluno.id,
          codigoAcesso: codigo,
          turmaId: aluno.turmaId,
          turma: { ativa: true },
          ativo: true,
          versaoAcesso: aluno.versaoAcesso,
          pinHash: aluno.pinHash,
          pinFalhas: aluno.pinFalhas,
          bloqueadoAte: aluno.bloqueadoAte,
        },
        data: correto
          ? { pinHash: aluno.pinHash ?? pinNovo, ultimoAcesso: agora, pinFalhas: 0, bloqueadoAte: null }
          : bloquear
            ? { pinFalhas: 0, bloqueadoAte: new Date(agora.getTime() + BLOQUEIO_MS) }
            : { pinFalhas: falhas },
      });
      // Se outra requisição alterou o PIN ou o contador, revalida no estado vigente.
      if (alterados.count !== 1) continue;
      if (!correto) {
        throw new UnauthorizedException(
          bloquear
            ? "PIN errado de novo. O acesso ficou bloqueado por 15 minutos."
            : `PIN errado. Você ainda tem ${MAX_FALHAS - falhas} ${MAX_FALHAS - falhas === 1 ? "tentativa" : "tentativas"}.`,
        );
      }

      const sessao: Sessao = { sub: aluno.id, papel: "aluno", turmaId: aluno.turmaId, v: aluno.versaoAcesso };
      return {
        // o aluno continua conectado entre aberturas do app (MOD-AUT-006)
        token: await this.jwt.signAsync(sessao, { expiresIn: "180d" }),
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          avatar: aluno.avatar ? { rosto: rostoDoAvatar(aluno.avatar), svg: aluno.avatar.svg } : null,
        },
        turma: { id: aluno.turma.id, nome: aluno.turma.nome, serie: aluno.turma.serie },
      };
    }
    throw new HttpException("Tente entrar novamente em instantes.", HttpStatus.TOO_MANY_REQUESTS);
  }
}
