# PRD do requisito MOD-PRF-009

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Cada indicador mostra, na própria tela, sua definição SMART: o que mede, como é calculado, por que a meta é atingível, por que importa e em que período.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-04 Como **professor**, quero entender como cada indicador é calculado, para confiar no número e explicá-lo à coordenação.

- **HU-PRF-04** CA-01: Cada indicador tem "Como é medido", que abre as partes Específico, Mensurável, Atingível, Relevante e Temporal e a quantidade de resultados usados.
- **HU-PRF-04** CA-02: O texto exibido é o mesmo desta seção 5.2 (vem de `INDICADORES_SMART`).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/%28painel%29)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
