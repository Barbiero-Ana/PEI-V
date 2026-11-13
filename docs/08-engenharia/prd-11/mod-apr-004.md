# PRD do requisito MOD-APR-004

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Indicar o jeito de aprender principal do aluno somente nas condições da RN-09.

Origem: [PRD-11 — Análise de aprendizagem](../../02-modulos/PRD-11%20%E2%80%94%20An%C3%A1lise%20de%20aprendizagem.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-APR-03 Como **professor**, quero que a análise só apareça com dados suficientes, para não rotular um aluno por uma jogada.

- **HU-APR-03** CA-01: Dado um aluno com 1 jogada em um formato, então o app não indica jeito principal (RN-09).
- **HU-APR-03** CA-02: Os níveis aparecem como "vai muito bem", "está crescendo" e "vale treinar", nunca como "fraco" ou "ruim".

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/aprendizagem.ts](../../../packages/core/src/aprendizagem.ts)
- [apps/web/lib/painel/pentagrama.ts](../../../apps/web/lib/painel/pentagrama.ts)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
