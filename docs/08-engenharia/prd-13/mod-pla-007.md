# PRD do requisito MOD-PLA-007

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A ficha da turma e a do aluno levam a um plano novo com a turma (e o aluno) já marcados.

Origem: [PRD-13 — Planejamento de aulas](../../02-modulos/PRD-13%20%E2%80%94%20Planejamento%20de%20aulas.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PLA-02 Como **professor**, quero começar um plano direto da ficha da turma ou do aluno, para não preencher de novo o que já sei.

- **HU-PLA-02** CA-01: Dado o botão de planejar na ficha da turma, então o formulário abre com a turma já escolhida.
- **HU-PLA-02** CA-02: Dada a ficha de um aluno, então o plano abre com a turma e o aluno já marcados em acompanhamento.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)/planejamento](../../../apps/web/app/professor/%28painel%29/planejamento)
- [packages/core/src/planejamento.ts](../../../packages/core/src/planejamento.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
