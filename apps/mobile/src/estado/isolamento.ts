/** Persistência e ciclo de sessão sem dependências nativas, para teste em Node. */
export interface Armazenamento {
  getItem(chave: string): Promise<string | null>;
  setItem(chave: string, valor: string): Promise<unknown>;
}

export interface ContaAluno {
  token: string;
  aluno: { id: string; nome: string; avatar?: { rosto?: object; svg?: string } | null };
  turma: { id: string; nome: string };
}

export const SESSAO = "modolume:sessao:v2";
export const CONTA_LEGADA = "modolume:conta:v1";
export const JOGADOR_LEGADO = "modolume:aluno:v3";
export const identidadeDa = (conta: ContaAluno | null) =>
  conta ? `aluno:${encodeURIComponent(conta.aluno.id)}` : "visitante";
export const chaveDados = (tipo: "jogador" | "conta", identidade: string) =>
  `modolume:isolado:v2:${identidade}:${tipo}`;

export class EscopoIdentidade {
  private vigente = true;
  constructor(readonly identidade: string) {}
  ativa = () => this.vigente;
  encerrar() {
    this.vigente = false;
  }
  capturar(conta: ContaAluno | null, montado: () => boolean = () => true) {
    if (!this.vigente || !conta || identidadeDa(conta) !== this.identidade) return null;
    return { alunoId: conta.aluno.id, token: conta.token, ativa: () => this.ativa() && montado() };
  }
}

/** Escritas serializadas por chave, inclusive durante desmontagem/remontagem. */
export class RepositorioIdentidades {
  private escritas = new Map<string, Promise<unknown>>();
  private aberturas = new Map<string, Promise<unknown>>();
  constructor(private readonly storage: Armazenamento) {}
  async aguardarEscritas() {
    await Promise.all(this.escritas.values());
  }
  gravar(chave: string, valor: unknown): Promise<void> {
    const json = JSON.stringify(valor);
    const anterior = this.escritas.get(chave) ?? Promise.resolve();
    const tarefa = anterior.catch(() => {}).then(() => this.storage.setItem(chave, json));
    this.escritas.set(chave, tarefa);
    // A rejeição ainda é entregue ao chamador; evita promessa solta sem handler.
    void tarefa.catch(() => {});
    return tarefa.then(() => {});
  }
  async ler<T>(chave: string): Promise<T | null> {
    await this.escritas.get(chave);
    const bruto = await this.storage.getItem(chave);
    if (bruto === null) return null;
    const valor: unknown = JSON.parse(bruto);
    if (valor === null || typeof valor !== "object") throw new Error("Armazenamento local inválido.");
    return valor as T;
  }
  async temLegado() {
    const valores = await Promise.all([this.storage.getItem(JOGADOR_LEGADO), this.storage.getItem(CONTA_LEGADA)]);
    return valores.some((v) => v !== null);
  }
  async sessao(): Promise<ContaAluno | null> {
    const s = await this.ler<{ conta: ContaAluno | null }>(SESSAO);
    const origem = s ?? (await this.ler<{ conta: ContaAluno | null }>(CONTA_LEGADA));
    // Só a sessão tem identidade explícita. Não atribui o progresso global a ela.
    if (!origem) return null;
    if (!Object.hasOwn(origem, "conta")) throw new Error("Sessão local inválida.");
    const conta = origem.conta;
    if (conta !== null && (!conta.aluno?.id || !conta.aluno.nome || !conta.token || !conta.turma?.id))
      throw new Error("Sessão local inválida.");
    if (!s) await this.gravar(SESSAO, { conta });
    return conta;
  }
  async encerrarSessao() {
    const visitante = identidadeDa(null);
    const envelope = await this.ler<{ identidade: string; dados: { semTurma?: boolean } }>(
      chaveDados("conta", visitante),
    );
    if (envelope?.identidade === visitante && envelope.dados?.semTurma) {
      await this.salvar("conta", visitante, { ...envelope.dados, semTurma: false });
    }
    await this.gravar(SESSAO, { conta: null });
  }
  dados<T>(tipo: "jogador" | "conta", identidade: string, criar: () => T | Promise<T>): Promise<T> {
    const chave = chaveDados(tipo, identidade);
    const emCurso = this.aberturas.get(chave);
    if (emCurso) return emCurso as Promise<T>;
    const tarefa = this.abrirDados(tipo, identidade, criar).finally(() => this.aberturas.delete(chave));
    this.aberturas.set(chave, tarefa);
    return tarefa;
  }
  private async abrirDados<T>(tipo: "jogador" | "conta", identidade: string, criar: () => T | Promise<T>): Promise<T> {
    const chave = chaveDados(tipo, identidade);
    const envelope = await this.ler<{ identidade: string; dados: T }>(chave);
    if (envelope) {
      if (envelope.identidade !== identidade || !envelope.dados) throw new Error("Identidade local inválida.");
      return envelope.dados;
    }
    const dados = await criar();
    await this.salvar(tipo, identidade, dados);
    return dados;
  }
  salvar<T>(tipo: "jogador" | "conta", identidade: string, dados: T) {
    return this.gravar(chaveDados(tipo, identidade), { identidade, dados });
  }
  /** Único dado legado com autoria explícita: cada jogada carrega alunoId.
   * Só copia antes de criar o novo snapshot. As chaves antigas ficam intactas.
   * Cache, conclusões, avatar e progresso globais NÃO têm origem comprovável. */
  async filaLegada<T extends { id: string; alunoId: string }>(alunoId: string): Promise<T[]> {
    const legado = await this.ler<{ fila?: T[] }>(CONTA_LEGADA);
    if (!legado) return [];
    if (!Array.isArray(legado.fila)) throw new Error("Fila legada inválida.");
    return legado.fila.filter((j) => j.alunoId === alunoId && typeof j.id === "string");
  }
}

export type OperacaoAluno = NonNullable<ReturnType<EscopoIdentidade["capturar"]>>;

/** Respostas de leitura só podem ser aplicadas pela sessão que as iniciou. */
export async function receberNoEscopo<T>(
  sessao: OperacaoAluno,
  buscar: (token: string) => Promise<T>,
  aplicar: (valor: T) => void,
) {
  if (!sessao.ativa()) return;
  const valor = await buscar(sessao.token);
  if (sessao.ativa()) aplicar(valor);
}

export async function sincronizarFila<T extends { id: string; alunoId: string }>(
  sessao: OperacaoAluno,
  fila: T[],
  enviar: (token: string, lote: Omit<T, "alunoId">[]) => Promise<{ recebidas: string[]; recusadas?: string[] }>,
  confirmar: (ids: Set<string>, rejeicoes: Set<string>) => void,
) {
  const minhas = fila.filter((j) => j.alunoId === sessao.alunoId);
  for (let i = 0; i < minhas.length; i += 100) {
    if (!sessao.ativa()) return;
    const lote = minhas.slice(i, i + 100).map(({ alunoId: _alunoId, ...j }) => j);
    const { recebidas, recusadas = [] } = await enviar(sessao.token, lote);
    if (!sessao.ativa()) return;
    const enviados = new Set(lote.map((j) => j.id));
    const aceitas = new Set(recebidas.filter((id) => enviados.has(id)));
    confirmar(aceitas, new Set(recusadas.filter((id) => enviados.has(id) && !aceitas.has(id))));
  }
}
