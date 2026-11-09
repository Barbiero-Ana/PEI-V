import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTA_LEGADA,
  JOGADOR_LEGADO,
  SESSAO,
  EscopoIdentidade,
  RepositorioIdentidades,
  chaveDados,
  identidadeDa,
  receberNoEscopo,
  sincronizarFila,
  type Armazenamento,
  type ContaAluno,
} from "../src/estado/isolamento";

class Memoria implements Armazenamento {
  dados = new Map<string, string>();
  async getItem(chave: string) {
    return this.dados.get(chave) ?? null;
  }
  async setItem(chave: string, valor: string) {
    this.dados.set(chave, valor);
  }
}
const conta = (id: string): ContaAluno => ({
  token: `token-de-teste-${id}`,
  aluno: { id, nome: id },
  turma: { id: "turma", nome: "Turma" },
});
const registro = (id: string) => ({
  progresso: { missao: { estrelas: id === "a" ? 3 : 1 } },
  resultados: [{ missaoId: id }],
  compras: [id],
  gastos: 5,
  jogador: { nome: id, rosto: { cabelo: id } },
  feitas: { [id]: { acerto: 80 } },
});
function adiada<T>() {
  let resolver!: (valor: T) => void;
  let rejeitar!: (erro: Error) => void;
  const promessa = new Promise<T>((resolve, reject) => {
    resolver = resolve;
    rejeitar = reject;
  });
  return { promessa, resolver, rejeitar };
}
describe("Isolamento de identidades e sincronização mobile", () => {
  it("logout pede login de novo mesmo quando o visitante já usava o app sem turma", async () => {
    const storage = new Memoria();
    const repo = new RepositorioIdentidades(storage);
    const aluno = conta("a");
    const fila = [{ id: "pendente", alunoId: "a" }];
    await repo.gravar(SESSAO, { conta: aluno });
    await repo.salvar("conta", identidadeDa(null), { semTurma: true, feitas: { exemplo: 1 } });
    await repo.salvar("conta", identidadeDa(aluno), { fila });
    await repo.encerrarSessao();

    const reaberto = new RepositorioIdentidades(storage);
    assert.equal(await reaberto.sessao(), null);
    assert.deepEqual(await reaberto.dados("conta", identidadeDa(null), () => ({})), {
      semTurma: false,
      feitas: { exemplo: 1 },
    });
    assert.deepEqual(await reaberto.dados("conta", identidadeDa(aluno), () => ({})), { fila });
  });
  it("A, B e visitante têm progresso, histórico, compras, avatar e conclusões independentes", async () => {
    const storage = new Memoria();
    const repo = new RepositorioIdentidades(storage);
    for (const c of [conta("a"), conta("b"), null]) {
      const identidade = identidadeDa(c);
      await repo.salvar("jogador", identidade, registro(c?.aluno.id ?? "visitante"));
    }
    for (const id of ["a", "b", "visitante"]) {
      const identidade = identidadeDa(id === "visitante" ? null : conta(id));
      assert.deepEqual(await repo.dados("jogador", identidade, () => ({})), registro(id));
    }
  });
  it("reinício restaura somente a sessão e os snapshots da identidade selecionada, sem rede", async () => {
    const storage = new Memoria();
    let repo = new RepositorioIdentidades(storage);
    await repo.salvar("jogador", identidadeDa(conta("a")), registro("a"));
    await repo.salvar("conta", identidadeDa(conta("a")), { fila: [{ id: "pendente", alunoId: "a" }] });
    await repo.gravar(SESSAO, { conta: conta("a") });
    repo = new RepositorioIdentidades(storage);
    assert.deepEqual(await repo.sessao(), conta("a"));
    assert.deepEqual(await repo.dados("jogador", identidadeDa(await repo.sessao()), () => ({})), registro("a"));
    assert.deepEqual(await repo.dados("conta", identidadeDa(conta("a")), () => ({})), {
      fila: [{ id: "pendente", alunoId: "a" }],
    });
    await repo.gravar(SESSAO, { conta: null });
    assert.equal(await new RepositorioIdentidades(storage).sessao(), null);
    assert.deepEqual(await repo.dados("jogador", identidadeDa(conta("a")), () => ({})), registro("a"));
  });
  it("mantém os bytes legados intactos e não atribui progresso global a visitante ou conta", async () => {
    const storage = new Memoria();
    const antigo = JSON.stringify(registro("origem-desconhecida"));
    storage.dados.set(JOGADOR_LEGADO, antigo);
    storage.dados.set(CONTA_LEGADA, JSON.stringify({ conta: conta("a"), fila: [], feitas: { antiga: true } }));
    const repo = new RepositorioIdentidades(storage);
    assert.equal(await repo.temLegado(), true);
    assert.deepEqual(await repo.sessao(), conta("a"));
    await repo.gravar(SESSAO, { conta: null });
    assert.equal(await new RepositorioIdentidades(storage).sessao(), null);
    for (const c of [null, conta("a"), conta("b")]) {
      assert.deepEqual(await repo.dados("jogador", identidadeDa(c), () => ({ progresso: {} })), { progresso: {} });
    }
    assert.equal(storage.dados.get(JOGADOR_LEGADO), antigo);
    assert.equal(JSON.parse(storage.dados.get(CONTA_LEGADA)!).feitas.antiga, true);
  });
  it("migra apenas filas com alunoId explícito e não reimporta pendências já confirmadas", async () => {
    const storage = new Memoria();
    const repo = new RepositorioIdentidades(storage);
    storage.dados.set(
      CONTA_LEGADA,
      JSON.stringify({ fila: [{ id: "a-1", alunoId: "a" }, { id: "b-1", alunoId: "b" }, { id: "sem-origem" }] }),
    );
    const ler = (id: string) =>
      repo.dados("conta", identidadeDa(conta(id)), async () => ({ fila: await repo.filaLegada(id) }));
    assert.deepEqual(await ler("a"), { fila: [{ id: "a-1", alunoId: "a" }] });
    assert.deepEqual(await ler("b"), { fila: [{ id: "b-1", alunoId: "b" }] });
    await repo.salvar("conta", identidadeDa(conta("a")), { fila: [] });
    assert.deepEqual(await ler("a"), { fila: [] });
    assert.equal(JSON.parse(storage.dados.get(CONTA_LEGADA)!).fila.length, 3);
  });
  for (const tipo of ["progresso", "atividades", "perfil"] as const) {
    it(`resposta de ${tipo} de A não é aplicada após A → B → A`, async () => {
      const escopoA = new EscopoIdentidade(identidadeDa(conta("a")));
      const espera = adiada<{ valor: string }>();
      let aplicadas = 0;
      const tarefa = receberNoEscopo(
        escopoA.capturar(conta("a"))!,
        async (token) => {
          assert.equal(token, conta("a").token);
          return espera.promessa;
        },
        () => {
          aplicadas++;
        },
      );
      escopoA.encerrar();
      const b = new EscopoIdentidade(identidadeDa(conta("b")));
      b.encerrar();
      const novaA = new EscopoIdentidade(identidadeDa(conta("a")));
      espera.resolver({ valor: "antigo" });
      await tarefa;
      assert.equal(aplicadas, 0);
      assert.equal(novaA.ativa(), true);
    });
  }
  it("fila de A nunca é enviada com token de B, mesmo se um snapshot contiver ambas", async () => {
    const fila = [
      { id: "a-1", alunoId: "a" },
      { id: "b-1", alunoId: "b" },
    ];
    const sessao = new EscopoIdentidade(identidadeDa(conta("b"))).capturar(conta("b"))!;
    let confirmadas: string[] = [];
    await sincronizarFila(
      sessao,
      fila,
      async (token, lote) => {
        assert.equal(token, conta("b").token);
        assert.deepEqual(lote, [{ id: "b-1" }]);
        return { recebidas: ["a-1", "b-1", "id-nao-enviado"] };
      },
      (ids) => {
        confirmadas = [...ids];
      },
    );
    assert.deepEqual(confirmadas, ["b-1"]);
  });
  it("separa recusas explícitas de confirmações e ignora respostas de IDs alheios ao lote", async () => {
    const sessao = new EscopoIdentidade(identidadeDa(conta("a"))).capturar(conta("a"))!;
    const fila = ["aceita", "recusada", "pendente"].map((id) => ({ id, alunoId: "a" }));
    await sincronizarFila(
      sessao,
      fila,
      async () => ({ recebidas: ["aceita"], recusadas: ["recusada", "aceita", "alheia"] }),
      (aceitas, recusadas) => {
        assert.deepEqual([...aceitas], ["aceita"]);
        assert.deepEqual([...recusadas], ["recusada"]);
      },
    );
  });
  it("troca de conta durante lote não confirma resposta antiga nem envia lotes seguintes", async () => {
    const escopo = new EscopoIdentidade(identidadeDa(conta("a")));
    const espera = adiada<{ recebidas: string[] }>();
    let requisicoes = 0;
    let confirmacoes = 0;
    const fila = Array.from({ length: 201 }, (_, i) => ({ id: `a-${i}`, alunoId: "a" }));
    const tarefa = sincronizarFila(
      escopo.capturar(conta("a"))!,
      fila,
      async () => {
        requisicoes++;
        return espera.promessa;
      },
      () => {
        confirmacoes++;
      },
    );
    escopo.encerrar();
    espera.resolver({ recebidas: ["a-0"] });
    await tarefa;
    assert.equal(requisicoes, 1);
    assert.equal(confirmacoes, 0);
    assert.equal(fila.length, 201);
  });
  it("sem rede preserva fila para novo envio após reinício", async () => {
    const storage = new Memoria();
    const repo = new RepositorioIdentidades(storage);
    const id = identidadeDa(conta("a"));
    const fila = [{ id: "a-1", alunoId: "a" }];
    await repo.salvar("conta", id, { fila });
    await assert.rejects(
      sincronizarFila(
        new EscopoIdentidade(id).capturar(conta("a"))!,
        fila,
        async () => {
          throw new Error("offline");
        },
        () => assert.fail("Não confirmar sem resposta"),
      ),
      /offline/,
    );
    assert.deepEqual(await new RepositorioIdentidades(storage).dados("conta", id, () => ({})), { fila });
  });
  it("token de outra identidade e sessão desmontada não podem iniciar sincronização", async () => {
    const escopo = new EscopoIdentidade(identidadeDa(conta("a")));
    assert.equal(escopo.capturar(conta("b")), null);
    const sessao = escopo.capturar(conta("a"), () => false)!;
    await sincronizarFila(
      sessao,
      [{ id: "a-1", alunoId: "a" }],
      async () => {
        assert.fail("Não enviar após desmontagem");
      },
      () => assert.fail("Não confirmar"),
    );
  });
  it("escritas lentas são ordenadas e a leitura espera a última versão", async () => {
    const storage = new Memoria();
    const espera = adiada<void>();
    let primeira = true;
    const salvar = storage.setItem.bind(storage);
    storage.setItem = async (chave, valor) => {
      if (primeira) {
        primeira = false;
        await espera.promessa;
      }
      await salvar(chave, valor);
    };
    const repo = new RepositorioIdentidades(storage);
    const a = repo.salvar("jogador", "aluno:a", registro("a"));
    const b = repo.salvar("jogador", "aluno:a", registro("b"));
    const leitura = repo.dados("jogador", "aluno:a", () => ({}));
    espera.resolver();
    await Promise.all([a, b]);
    assert.deepEqual(await leitura, registro("b"));
  });
  it("snapshot inválido não é sobrescrito com estado vazio", async () => {
    const storage = new Memoria();
    const chave = chaveDados("jogador", "aluno:a");
    for (const bruto of ["{incompleto", "null", JSON.stringify({ identidade: "aluno:b", dados: registro("b") })]) {
      storage.dados.set(chave, bruto);
      await assert.rejects(new RepositorioIdentidades(storage).dados("jogador", "aluno:a", () => ({})));
      assert.equal(storage.dados.get(chave), bruto);
    }
  });
  it("abertura concorrente inicializa uma única vez, sem sobrescrever dados já usados", async () => {
    const storage = new Memoria();
    const repo = new RepositorioIdentidades(storage);
    const espera = adiada<void>();
    let criacoes = 0;
    const criar = async () => {
      criacoes++;
      await espera.promessa;
      return registro("a");
    };
    const a = repo.dados("jogador", "aluno:a", criar);
    const b = repo.dados("jogador", "aluno:a", criar);
    espera.resolver();
    assert.deepEqual(await a, registro("a"));
    assert.deepEqual(await b, registro("a"));
    assert.equal(criacoes, 1);
  });
  it("a troca espera as escritas pendentes antes de persistir a nova sessão", async () => {
    const storage = new Memoria();
    const repo = new RepositorioIdentidades(storage);
    const espera = adiada<void>();
    const salvar = storage.setItem.bind(storage);
    storage.setItem = async (chave, valor) => {
      if (chave !== SESSAO) await espera.promessa;
      await salvar(chave, valor);
    };
    const escrita = repo.salvar("jogador", "aluno:a", registro("a"));
    const troca = (async () => {
      await repo.aguardarEscritas();
      await repo.gravar(SESSAO, { conta: conta("b") });
    })();
    assert.equal(storage.dados.has(SESSAO), false);
    espera.resolver();
    await Promise.all([escrita, troca]);
    assert.deepEqual(await repo.sessao(), conta("b"));
    assert.deepEqual(await repo.dados("jogador", "aluno:a", () => ({})), registro("a"));
  });
  it("falha de leitura não cria snapshot vazio sobre dados existentes", async () => {
    const storage = new Memoria();
    const chave = chaveDados("jogador", "aluno:a");
    const anterior = JSON.stringify({ identidade: "aluno:a", dados: registro("a") });
    storage.dados.set(chave, anterior);
    storage.getItem = async () => {
      throw new Error("Falha nativa");
    };
    await assert.rejects(new RepositorioIdentidades(storage).dados("jogador", "aluno:a", () => ({})));
    assert.equal(storage.dados.get(chave), anterior);
  });
});
