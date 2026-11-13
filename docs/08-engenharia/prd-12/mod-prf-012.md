# PRD do requisito MOD-PRF-012

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Os alunos que pedem atenção aparecem com o motivo em uma frase, conforme a RN-12.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-02 Como **professor**, quero ver quem pede atenção e por quê, para agir antes da próxima avaliação.

- **HU-PRF-02** CA-01: Dado um aluno com acerto médio de 55%, então ele aparece em "Pedem atenção" com a frase "Acerto abaixo de 60%" (RN-12).
- **HU-PRF-02** CA-02: Dado um aluno com queda de 12 pontos, então a frase informa a queda em pontos.
- **HU-PRF-02** CA-03: O menu mostra, ao lado de "Alunos", quantos alunos pedem atenção.
- **HU-PRF-02** CA-04: Avaliações pendentes aparecem na Visão geral (depende do PRD-15).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
