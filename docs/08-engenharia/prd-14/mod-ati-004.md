# PRD do requisito MOD-ATI-004

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor seleciona as turmas que recebem a atividade.

Origem: [PRD-14 — Atividades do professor](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ATI-04 Como **professor**, quero enviar para as turmas certas, com data de início e prazo.

- **HU-ATI-04** CA-01: O envio exige ao menos uma turma ("Escolha ao menos uma turma.") e a data de liberação.
- **HU-ATI-04** CA-02: Atividades enviadas aparecem na agenda da Visão geral, no dia de liberação.
- **HU-ATI-04** CA-03: O professor define a data limite, e o app mostra o prazo (MIS-013).
- **HU-ATI-04** CA-04: A atividade enviada aparece no app dos alunos da turma, na aba "Professor", a partir da data de liberação.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
