# PRD do requisito MOD-ATI-010

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor vê, por atividade, os alunos que concluíram, que estão em andamento e que não iniciaram.

Origem: [PRD-14 — Atividades do professor](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ATI-06 Como **professor**, quero saber quem já fez, quem está fazendo e quem não começou.

- **HU-ATI-06** CA-01: A página da atividade mostra quem já fez (com o acerto) e quem ainda não fez.
- **HU-ATI-06** CA-02: Separar também quem começou e não terminou ("em andamento").

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Evidência parcial.

Primeiro início persistido e separado da entrega. Teste real confirma em andamento e concluída. Conferência em aparelho pendente.
