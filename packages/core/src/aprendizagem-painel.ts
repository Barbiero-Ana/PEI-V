import type { DadosModolume } from "./entidade";
import { analisarAprendizagem, JEITOS } from "./aprendizagem";
import type { ResultadoJogada } from "./missoes";

/** Preserva as medidas originais; registros sem fases não simulam autonomia. */
export function jogadasDeAprendizagem(dados: DadosModolume, alunoId: string): ResultadoJogada[] {
  const aplicacoes = new Map(dados.aplicacoes.map((a) => [a.id, a]));
  const atividades = new Map(dados.atividades.map((a) => [a.id, a]));
  return dados.resultados.flatMap((r) => {
    const aplicacao = aplicacoes.get(r.aplicacaoId);
    const atividade = aplicacao && atividades.get(aplicacao.atividadeId);
    if (
      r.alunoId !== alunoId ||
      !aplicacao ||
      !atividade ||
      !r.rodadas ||
      r.acertosDePrimeira === undefined ||
      r.dicas === undefined
    )
      return [];
    return [
      {
        ...r,
        id: r.id,
        missaoId: atividade.id,
        formato: atividade.formato,
        rodadas: r.rodadas,
        acertosDePrimeira: r.acertosDePrimeira,
        dicas: r.dicas,
        estrelas: r.estrelas ?? 1,
        data: aplicacao.data,
      },
    ];
  });
}

export const PONTAS_APRENDIZAGEM = ["Visual", "Mãos na massa", "Lógico", "Simbólico", "Espacial"] as const;
export function dominioPorJeito(resultados: ResultadoJogada[]) {
  const analise = analisarAprendizagem(resultados);
  return PONTAS_APRENDIZAGEM.map((jeito) => {
    const formatos = analise.formatos.filter((f) => JEITOS[f.formato].jeito === jeito && f.dominio !== null);
    const confiaveis = formatos.filter((f) => f.confianca === "boa");
    const referencia = confiaveis.length ? confiaveis : formatos;
    return {
      jeito,
      confianca: confiaveis.length ? ("boa" as const) : formatos.length ? ("pouca" as const) : ("nenhuma" as const),
      dominio: referencia.length
        ? Math.round(referencia.reduce((s, f) => s + f.dominio!, 0) / referencia.length)
        : null,
      atividades: formatos.reduce((s, f) => s + f.jogadas, 0),
      formatos: formatos.map((f) => f.rotulo),
    };
  });
}
