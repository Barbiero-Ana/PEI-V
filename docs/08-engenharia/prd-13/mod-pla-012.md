# MOD-PLA-012

O professor duplica um plano para outra turma ou data; a cópia volta para "planejada" e sem registro.

Origem: [PRD-13 — Planejamento de aulas](../../02-modulos/PRD-13%20%E2%80%94%20Planejamento%20de%20aulas.md), seção 5. Prioridade **D**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PLA-05 Como **professor**, quero corrigir, duplicar ou excluir um plano sem risco de apagar por engano.

- **HU-PLA-05** CA-01: A exclusão fica escondida em "Excluir plano" e exige um segundo clique em "Excluir definitivamente".
- **HU-PLA-05** CA-02: "Duplicar" copia o plano para outra turma ou data, como planejado e sem registro.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)/planejamento](../../../apps/web/app/professor/(painel)/planejamento)
- [packages/core/src/planejamento.ts](../../../packages/core/src/planejamento.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
