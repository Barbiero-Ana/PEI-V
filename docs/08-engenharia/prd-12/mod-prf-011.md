# PRD do requisito MOD-PRF-011

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A Visão geral começa pela agenda da semana (aulas e atividades que entram no app), seguida dos alunos que pedem atenção e das turmas.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-01 Como **professor**, quero abrir o painel e ver minha semana, para me organizar antes das aulas.

- **HU-PRF-01** CA-01: A Visão geral começa pela data de hoje, pela saudação e pela agenda de segunda a sexta, com as aulas e as atividades que entram no app em cada dia.
- **HU-PRF-01** CA-02: Dadas aulas passadas sem registro, então um aviso no topo da agenda informa quantas são e leva à aula.
- **HU-PRF-01** CA-03: A ação principal da tela ("Novo plano de aula") é a única com botão preenchido.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/%28painel%29)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
