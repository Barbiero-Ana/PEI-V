# MOD-PRF-008

O painel exibe, para cada turma, os indicadores SMART IND-01 a IND-06, cada um com valor, meta, período de medição, comparação com o período anterior e situação (RN-13).

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-03 Como **professor**, quero saber se cada turma está atingindo as metas, para decidir onde concentrar esforço.

- **HU-PRF-03** CA-01: A aba "Metas" da turma mostra os seis indicadores com valor, meta, comparação com as 4 semanas anteriores e situação.
- **HU-PRF-03** CA-02: O topo da aba informa o período medido, o período de comparação, a data da próxima revisão e quantas metas foram atingidas.
- **HU-PRF-03** CA-03: Cada cartão de turma na Visão geral mostra "N de 6 atingidas" e quantas estão abaixo da meta.
- **HU-PRF-03** CA-04: Dada uma turma sem atividades no período, então os indicadores aparecem como "Sem dados", e não como zero.
- **HU-PRF-03** CA-05: A aba "Metas" mostra um contador em destaque quando há metas abaixo.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Evidência parcial.

indicadores-smart.test.ts exercita cálculos em memória. Unidade de IND-06 e viés de IND-04 permanecem em revisão.
