# PRD do requisito MOD-ALU-005

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A tela inicial exibe os feedbacks recentes do professor.

Origem: [PRD-06 — Experiência do aluno](../../02-modulos/PRD-06%20%E2%80%94%20Experi%C3%AAncia%20do%20aluno.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Pendente**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ALU-04 Como **aluno**, quero ver o recado do professor na tela inicial, para saber o que melhorar.

- **HU-ALU-04** CA-01: Dado um feedback concluído pelo professor, quando o aluno abre o app, então o recado aparece na tela inicial com o nome da atividade.
- **HU-ALU-04** CA-02: Depois de lido, o recado sai da tela inicial e fica disponível no histórico.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/(abas)](../../../apps/mobile/src/app/%28abas%29)
- [apps/mobile/src/componentes/BarraAbas.tsx](../../../apps/mobile/src/componentes/BarraAbas.tsx)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
