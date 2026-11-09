import type { ProvedorDados } from "./provedor";
import { criarDadosDemonstracao } from "./dados-demonstracao";
import type { Aluno, Aplicacao, Atividade, Id, ObjetivoPedagogico, DadosModolume, Resultado, Turma } from "./entidade";
import type { LinhaResultado, NovaAtividade, NovaTurma, NovoAluno, NovoObjetivo } from "./esquema";

let contador = 0;
const novoId = (prefixo: string) => `${prefixo}-${Date.now().toString(36)}-${(contador += 1)}`;
const hoje = () => new Date().toISOString().slice(0, 10);

/** Cópia profunda — os dados do domínio são JSON-safe. */
const clonar = <T>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

/**
 * Provider em memória para desenvolvimento e para a demonstração.
 * O estado vive no processo — some ao recarregar o servidor. Suficiente
 * para o MVP; será trocado pelo `SupabaseDataProvider`.
 */
export class ProvedorDadosDemonstracao implements ProvedorDados {
  private data: DadosModolume;

  constructor(seed: DadosModolume = criarDadosDemonstracao()) {
    this.data = seed;
  }

  async carregarTudo(): Promise<DadosModolume> {
    return clonar(this.data);
  }

  async criarTurma(dados: NovaTurma): Promise<Turma> {
    const turma: Turma = {
      id: novoId("turma"),
      professorId: this.data.professores[0]!.id,
      ...dados,
    };
    this.data.turmas.push(turma);
    return turma;
  }

  async criarAluno(dados: NovoAluno): Promise<Aluno> {
    const aluno: Aluno = { id: novoId("al"), ...dados };
    this.data.alunos.push(aluno);
    return aluno;
  }

  async criarAtividade(dados: NovaAtividade): Promise<Atividade> {
    const atividade: Atividade = {
      id: novoId("ativ"),
      professorId: this.data.professores[0]!.id,
      conteudo: {},
      criadaEm: hoje(),
      ...dados,
    };
    this.data.atividades.push(atividade);
    return atividade;
  }

  async registrarResultados(input: { atividadeId: Id; turmaId: Id; data: string; linhas: LinhaResultado[] }) {
    const aplicacao: Aplicacao = {
      id: novoId("apl"),
      atividadeId: input.atividadeId,
      turmaId: input.turmaId,
      data: input.data,
    };
    this.data.aplicacoes.push(aplicacao);

    const alunosDaTurma = this.data.alunos.filter((a) => a.turmaId === input.turmaId);
    const resultados: Resultado[] = [];
    const ignoradas: string[] = [];

    for (const linha of input.linhas) {
      const aluno = alunosDaTurma.find((a) => a.codigo === linha.codigoAluno);
      if (!aluno) {
        ignoradas.push(linha.codigoAluno);
        continue;
      }
      const resultado: Resultado = {
        id: novoId("res"),
        aplicacaoId: aplicacao.id,
        alunoId: aluno.id,
        tentativas: linha.tentativas,
        percentualConclusao: linha.percentualConclusao,
        percentualAcerto: linha.percentualAcerto,
        tempoSegundos: linha.tempoSegundos,
      };
      this.data.resultados.push(resultado);
      resultados.push(resultado);
    }

    return { aplicacao, resultados, ignoradas };
  }

  async criarObjetivo(dados: NovoObjetivo): Promise<ObjetivoPedagogico> {
    const objetivo: ObjetivoPedagogico = {
      id: novoId("obj"),
      professorId: this.data.professores[0]!.id,
      descricao: dados.descricao,
      meta: dados.meta,
      turmaId: dados.turmaId,
      status: "não iniciado",
      progresso: 0,
    };
    this.data.objetivos.push(objetivo);
    return objetivo;
  }

  async atualizarProgressoObjetivo(id: Id, progresso: number): Promise<ObjetivoPedagogico> {
    const objetivo = this.data.objetivos.find((o) => o.id === id);
    if (!objetivo) throw new Error(`Objetivo não encontrado: ${id}`);
    objetivo.progresso = Math.max(0, Math.min(100, Math.round(progresso)));
    objetivo.status =
      objetivo.progresso >= 100 ? "alcançado" : objetivo.progresso > 0 ? "em andamento" : "não iniciado";
    return objetivo;
  }
}
