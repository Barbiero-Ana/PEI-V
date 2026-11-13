# PRD do requisito MOD-PLA-003

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O plano tem a situação rascunho, planejada ou realizada.

Origem: [PRD-13 — Planejamento de aulas](../../02-modulos/PRD-13%20%E2%80%94%20Planejamento%20de%20aulas.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PLA-04 Como **professor**, quero registrar como foi a aula, para manter o histórico da turma.

- **HU-PLA-04** CA-01: Dada uma aula passada sem registro, então a Visão geral e o menu avisam quantas são (RN-24).
- **HU-PLA-04** CA-02: Ao salvar o registro, o plano passa a "realizada" e o aviso some (RN-25).
- **HU-PLA-04** CA-03: Antes da data da aula, o registro aparece indisponível, com a data a partir da qual poderá ser feito.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)/planejamento](../../../apps/web/app/professor/%28painel%29/planejamento)
- [packages/core/src/planejamento.ts](../../../packages/core/src/planejamento.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
