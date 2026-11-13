# PRD do requisito MOD-APR-009

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Exibir a evolução do acerto ao longo dos meses.

Origem: [PRD-11 — Análise de aprendizagem](../../02-modulos/PRD-11%20%E2%80%94%20An%C3%A1lise%20de%20aprendizagem.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-APR-05 Como **professor**, quero ver a evolução ao longo dos meses, para saber se a turma está melhorando.

- **HU-APR-05** CA-01: A página Desempenho mostra o acerto médio de cada turma mês a mês.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/aprendizagem.ts](../../../packages/core/src/aprendizagem.ts)
- [apps/web/lib/painel/pentagrama.ts](../../../apps/web/lib/painel/pentagrama.ts)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
