# MOD-PRF-006

O painel indica as missões e formatos com maior uso de dicas.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Pendente**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-06 Como **professor**, quero comparar os formatos de atividade da turma, para escolher como ensinar e avaliar.

- **HU-PRF-06** CA-01: A aba "Formatos de atividade" da turma mostra o acerto médio por formato e quantos resultados sustentam cada número.
- **HU-PRF-06** CA-02: Com uma turma escolhida em Desempenho, conclusão e tentativas aparecem por formato (PRF-002).
- **HU-PRF-06** CA-03: O painel mostra as missões e os formatos com maior uso de dicas (PRF-006, fase 4).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
