# PRD-11 — Análise de aprendizagem

O núcleo calcula domínio para o app. O pentagrama web ainda usa acerto médio.

[PRD de origem](../../02-modulos/PRD-11%20%E2%80%94%20An%C3%A1lise%20de%20aprendizagem.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Professor | Saber em que tipo de atividade cada aluno e a turma vão melhor | Radar por aluno e por turma, com insights |
| Aluno | Conhecer o próprio jeito de aprender, sem rótulo | Cartão por formato e missão sugerida, na aba Conquistas |
| Escola | Evitar diagnóstico indevido | Amostra mínima e linguagem de tendência |

## Implementação

- [packages/core/src/aprendizagem.ts](../../../packages/core/src/aprendizagem.ts)
- [apps/web/lib/painel/pentagrama.ts](../../../apps/web/lib/painel/pentagrama.ts)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)

**Persistência** jogada, formato_atividade.

## Regras de negócio

- **RN-07** Domínio = 65% acerto de primeira + 20% autonomia + 15% precisão, nas 10 jogadas mais recentes do formato.
- **RN-08** Nível: 75 ou mais "vai muito bem"; 50 a 74 "está crescendo"; abaixo de 50 "vale treinar". Tendência quando a diferença entre as metades é de 12 pontos ou mais.
- **RN-09** Jeito principal só com 2 ou mais jogadas, 6 ou mais fases e domínio médio de 60 ou mais.
- **RN-21** No painel, o jeito em que o aluno vai melhor só aparece com pelo menos 3 atividades naquele jeito.

## Testes e limites

aprendizagem.test.ts e indicador.test.ts. Paridade entre interfaces pendente.

## Dependências

[PRD-12](../prd-12/README.md) · [PRD-04](../prd-04/README.md)

## Requisitos

- [MOD-APR-001](mod-apr-001.md) Associar cada missão a um formato de atividade e a um ou mais conteúdos.
- [MOD-APR-002](mod-apr-002.md) Calcular, para cada formato jogado, o acerto de primeira, a autonomia, a precisão e o domínio, conforme a RN-07.
- [MOD-APR-003](mod-apr-003.md) Classificar cada formato em nível e tendência, conforme a RN-08.
- [MOD-APR-004](mod-apr-004.md) Indicar o jeito de aprender principal do aluno somente nas condições da RN-09.
- [MOD-APR-005](mod-apr-005.md) Representar o resultado em um radar (pentagrama) com um eixo por jeito de aprender (Visual, Mãos na massa, Lógico, Simbólico e Espacial), cada um agrupando formatos de atividade.
- [MOD-APR-006](mod-apr-006.md) Atualizar o radar e os indicadores a cada nova jogada ou avaliação.
- [MOD-APR-007](mod-apr-007.md) Exibir ao aluno o jeito principal, um cartão por formato jogado, os formatos ainda não experimentados e uma missão sugerida.
- [MOD-APR-008](mod-apr-008.md) Exibir ao professor o radar e os indicadores de cada aluno e o consolidado da turma.
- [MOD-APR-009](mod-apr-009.md) Exibir a evolução do acerto ao longo dos meses.
