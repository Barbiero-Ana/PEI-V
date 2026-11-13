# PRD do requisito MOD-PLA-006

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor vê os planos em um calendário mensal.

Origem: [PRD-13 — Planejamento de aulas](../../02-modulos/PRD-13%20%E2%80%94%20Planejamento%20de%20aulas.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PLA-03 Como **professor**, quero ver meus planos em lista e no calendário, para me organizar no mês.

- **HU-PLA-03** CA-01: A lista de planos pode ser filtrada por turma.
- **HU-PLA-03** CA-02: O calendário mostra os planos do mês, com a cor da turma.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)/planejamento](../../../apps/web/app/professor/(painel)/planejamento)
- [packages/core/src/planejamento.ts](../../../packages/core/src/planejamento.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
