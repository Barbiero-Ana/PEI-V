# MOD-PRF-010

Um indicador abaixo ou perto da meta mostra uma ação sugerida e um atalho para planejar uma aula para a turma.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-05 Como **professor**, quero uma sugestão do que fazer quando uma meta não é atingida, para ir direto ao planejamento.

- **HU-PRF-05** CA-01: Dado um indicador "Abaixo da meta" ou "Perto da meta", então aparece "O que fazer:" com a ação sugerida e o atalho "Planejar aula" para a turma.
- **HU-PRF-05** CA-02: Indicadores com meta atingida não mostram ação, para não poluir a tela.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
