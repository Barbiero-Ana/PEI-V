# PRD do requisito MOD-IS-002

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O app usa a síntese de voz do sistema operacional, em português do Brasil.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

O PRD não mapeia uma história individual a este requisito.

Use a descrição da seção 5 como cenário de verificação. O PRD não associa um critério de aceite individual a este item.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma)
- [apps/api/scripts/verificar-banco.ts](../../../apps/api/scripts/verificar-banco.ts)
- [apps/web/middleware.ts](../../../apps/web/middleware.ts)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/ambiente.ts](../../../apps/mobile/src/estado/ambiente.ts)
- [packages/core](../../../packages/core)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
