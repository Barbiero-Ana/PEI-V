# PRD do requisito MOD-AVA-005

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor conclui a avaliação, tornando o feedback visível ao aluno.

Origem: [PRD-15 — Avaliação e feedback](../../02-modulos/PRD-15%20%E2%80%94%20Avalia%C3%A7%C3%A3o%20e%20feedback.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-AVA-03 Como **professor**, quero escrever um feedback e decidir quando o aluno vai vê-lo.

- **HU-AVA-03** CA-01: Dado um feedback salvo sem concluir, então o aluno não o vê (RN-28).
- **HU-AVA-03** CA-02: Ao concluir a avaliação, o feedback aparece no Início do aluno, e o aluno recebe um aviso (MOD-NOT-002).
- **HU-AVA-03** CA-03: O feedback não pode ficar vazio ao concluir.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/avaliacoes.ts](../../../apps/api/src/avaliacoes.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/mobile/src/app/feedback](../../../apps/mobile/src/app/feedback)

**Aceite nesta auditoria** Evidência parcial.

Somente avaliações publicadas são retornadas ao aluno. Teste real cobre ausência do rascunho e aviso de publicação.
