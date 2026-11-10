import { CONTA_LEGADA, type Armazenamento, type ContaAluno } from "./isolamento";

export const SESSAO_ANTIGA = "modolume:sessao:v2";
export const SESSAO_PROTEGIDA = "modolume.sessao.v3";
const LIMPEZA = "modolume:sessao:limpeza:v3";
const SNAPSHOT = /^modolume:isolado:(?:v2:(?:aluno:[^:]+|visitante):conta|v3:(?:aluno:[^:]+|visitante))$/;

type ArmazenamentoLocal = Armazenamento & {
  getAllKeys(): Promise<readonly string[]>;
  removeItem(chave: string): Promise<unknown>;
};

function objeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function lerSessao(bruto: string | null): ContaAluno | null {
  if (bruto === null) return null;
  const envelope: unknown = JSON.parse(bruto);
  if (!objeto(envelope) || !Object.hasOwn(envelope, "conta")) throw new Error("Sessão local inválida.");
  return contaDaSessao(envelope.conta);
}

function contaDaSessao(conta: unknown): ContaAluno | null {
  if (conta === null) return null;
  if (
    !objeto(conta) ||
    typeof conta.token !== "string" ||
    !conta.token ||
    !objeto(conta.aluno) ||
    typeof conta.aluno.id !== "string" ||
    !conta.aluno.id ||
    typeof conta.aluno.nome !== "string" ||
    !conta.aluno.nome ||
    !objeto(conta.turma) ||
    typeof conta.turma.id !== "string" ||
    !conta.turma.id ||
    typeof conta.turma.nome !== "string"
  )
    throw new Error("Sessão local inválida.");
  return {
    token: conta.token,
    aluno: { id: conta.aluno.id, nome: conta.aluno.nome },
    turma: { id: conta.turma.id, nome: conta.turma.nome },
  };
}

/** Mantém a credencial no cofre e limpa as cópias antigas sem descartar a fila de jogadas. */
export class RepositorioSessao {
  private abertura?: Promise<ContaAluno | null>;
  private escrita = Promise.resolve();

  constructor(
    private readonly cofre: Armazenamento,
    private readonly local: ArmazenamentoLocal,
  ) {}

  restaurar() {
    this.abertura ??= this.restaurarELimpar().finally(() => {
      this.abertura = undefined;
    });
    return this.abertura;
  }

  salvar(conta: ContaAluno | null) {
    // Avatar e SVG pertencem ao cache de perfil, fora do envelope pequeno do cofre.
    const bruto = JSON.stringify({ conta: contaDaSessao(conta) });
    const tarefa = this.escrita
      .catch(() => {})
      .then(async () => {
        await this.cofre.setItem(SESSAO_PROTEGIDA, bruto);
      });
    this.escrita = tarefa;
    return tarefa;
  }

  private async restaurarELimpar() {
    await this.escrita.catch(() => {});
    const etapa = await this.local.getItem(LIMPEZA);
    if (etapa === "1") return lerSessao(await this.cofre.getItem(SESSAO_PROTEGIDA));

    // O Keychain pode sobreviver à desinstalação. Só retome uma migração marcada neste armazenamento.
    const origem =
      etapa === "migrando"
        ? await this.cofre.getItem(SESSAO_PROTEGIDA)
        : ((await this.local.getItem(SESSAO_ANTIGA)) ?? (await this.local.getItem(CONTA_LEGADA)));
    const conta = lerSessao(origem);
    if (etapa !== "migrando") {
      await this.salvar(conta);
      await this.local.setItem(LIMPEZA, "migrando");
    }
    await this.local.removeItem(SESSAO_ANTIGA);
    for (const chave of await this.local.getAllKeys()) {
      if (chave !== CONTA_LEGADA && !SNAPSHOT.test(chave)) continue;
      const bruto = await this.local.getItem(chave);
      if (bruto === null) continue;
      const envelope: unknown = JSON.parse(bruto);
      if (!objeto(envelope)) continue;
      const cache =
        chave === CONTA_LEGADA ? envelope : chave.startsWith("modolume:isolado:v2:") ? envelope.dados : envelope.conta;
      if (objeto(cache) && Object.hasOwn(cache, "conta")) {
        delete cache.conta;
        await this.local.setItem(chave, JSON.stringify(envelope));
      }
    }
    await this.local.setItem(LIMPEZA, "1");
    return conta;
  }
}
