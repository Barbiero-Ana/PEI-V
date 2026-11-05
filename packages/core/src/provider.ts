import type { Aluno, Aplicacao, Atividade, Id, ObjetivoPedagogico, DadosModolume, Resultado, Turma } from "./types";
import type { LinhaResultado, NovaAtividade, NovaTurma, NovoAluno, NovoObjetivo } from "./schemas";

/**
 * Contrato de acesso a dados. A web e o app dependem SÓ desta interface —
 * hoje atendida por um provider em memória (`MockDataProvider`), depois
 * pelo Supabase, sem tocar na camada de tela.
 */
export interface DataProvider {
  carregarTudo(): Promise<DadosModolume>;

  criarTurma(dados: NovaTurma): Promise<Turma>;
  criarAluno(dados: NovoAluno): Promise<Aluno>;
  criarAtividade(dados: NovaAtividade): Promise<Atividade>;

  /** Cria a aplicação de uma atividade a uma turma e grava os resultados importados. */
  registrarResultados(input: {
    atividadeId: Id;
    turmaId: Id;
    data: string;
    linhas: LinhaResultado[];
  }): Promise<{ aplicacao: Aplicacao; resultados: Resultado[]; ignoradas: string[] }>;

  criarObjetivo(dados: NovoObjetivo): Promise<ObjetivoPedagogico>;
  atualizarProgressoObjetivo(id: Id, progresso: number): Promise<ObjetivoPedagogico>;
}
