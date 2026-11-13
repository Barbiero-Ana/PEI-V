# PRD do requisito MOD-NOT-001

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Avisar o aluno quando uma atividade for publicada para sua turma.

Origem: [PRD-16 — Notificações](../../02-modulos/PRD-16%20%E2%80%94%20Notifica%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-NOT-01 Como **aluno**, quero ser avisado de atividade nova e de prazo próximo, para não perder nada.

- **HU-NOT-01** CA-01: Dada uma atividade publicada para a turma, então os alunos recebem um aviso no app com o título.
- **HU-NOT-01** CA-02: Um dia antes do prazo, o aluno que não concluiu recebe um lembrete.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/api/src/avisos-aluno.ts](../../../apps/api/src/avisos-aluno.ts)
- [apps/mobile/src/app/avisos.tsx](../../../apps/mobile/src/app/avisos.tsx)
- [apps/web/lib/painel/alertas.ts](../../../apps/web/lib/painel/alertas.ts)
- [apps/web/components/painel/alertas.tsx](../../../apps/web/components/painel/alertas.tsx)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
