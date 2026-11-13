# PRD do requisito MOD-PRF-017

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A página Desempenho mostra as metas SMART: com "Todas as turmas", uma tabela com uma linha por turma e uma coluna por indicador; com uma turma escolhida, as metas completas da turma.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-10 Como **professor**, quero comparar as metas de todas as turmas numa só tela.

- **HU-PRF-10** CA-01: Em Desempenho com "Todas as turmas", a tabela "Metas por turma" tem uma linha por turma (com "N de 6 atingidas") e uma coluna por indicador, com valor e situação escrita.
- **HU-PRF-10** CA-02: Clicar no nome da turma mostra as metas completas dela, com "Como é medido" e "O que fazer".

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/%28painel%29)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
