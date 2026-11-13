# PRD do requisito MOD-PRF-016

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A situação de metas, alunos e resultados é escrita em texto, nunca indicada só por cor.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **N**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-08 Como **professor daltônico ou com baixa visão**, quero entender a situação sem depender de cores.

- **HU-PRF-08** CA-01: A situação de cada meta aparece escrita ("Meta atingida", "Perto da meta", "Abaixo da meta", "Sem dados").
- **HU-PRF-08** CA-02: A comparação com o período anterior aparece escrita ("Melhorou 3 pts em 4 semanas", "Piorou…").
- **HU-PRF-08** CA-03: Valores em alerta usam cor com contraste de pelo menos 4,5:1 sobre branco.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
