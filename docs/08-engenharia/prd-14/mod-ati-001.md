# PRD do requisito MOD-ATI-001

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Disponibilizar ao professor o catálogo de missões, com conteúdo, formato, número de fases e mapa.

Origem: [PRD-14 — Atividades do professor](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ATI-02 Como **professor**, quero escolher um jogo pronto do app, para usar montagem, manipulação ou 3D.

- **HU-ATI-02** CA-01: Dado o formato "pronta", então o professor escolhe um jogo do app em uma lista, e o editor não pede questões.
- **HU-ATI-02** CA-02: Cada item do catálogo mostra formato, número de fases e mapa.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)
- [apps/api/src/publicacoes.ts](../../../apps/api/src/publicacoes.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
