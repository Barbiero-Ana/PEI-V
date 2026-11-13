# PRD do requisito MOD-AVA-001

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor visualiza as atividades concluídas pelos alunos.

Origem: [PRD-15 — Avaliação e feedback](../../02-modulos/PRD-15%20%E2%80%94%20Avalia%C3%A7%C3%A3o%20e%20feedback.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AVA-01 Como **professor**, quero ver quais atividades cada aluno concluiu, para acompanhar a turma.

- **HU-AVA-01** CA-01: A ficha do aluno mostra os resultados recentes, com o nome da atividade, a data e o acerto.
- **HU-AVA-01** CA-02: A página de cada atividade mostra quem concluiu (ver MOD-ATI-010).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/avaliacoes.ts](../../../apps/api/src/avaliacoes.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/mobile/src/app/feedback](../../../apps/mobile/src/app/feedback)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
