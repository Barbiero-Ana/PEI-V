# PRD do requisito MOD-CON-002

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O registro do resultado e a atualização dos pontos ocorrem de forma atômica.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-QUA-04 Como **aluno**, quero não perder meu progresso se a internet cair ou o app atualizar.

- **HU-QUA-04** CA-01: Sem internet, o app continua funcionando e salva as jogadas.
- **HU-QUA-04** CA-02: O mesmo resultado enviado duas vezes é gravado uma única vez.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma)
- [apps/api/scripts/verificar-banco.ts](../../../apps/api/scripts/verificar-banco.ts)
- [apps/web/middleware.ts](../../../apps/web/middleware.ts)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [packages/core](../../../packages/core)

**Aceite nesta auditoria** Evidência parcial.

Conclusão local e fila são gravadas juntas. O protocolo novo grava histórico, crédito e compras na mesma transação da API. verificar-consolidacao.ts força falha no débito e confirma rollback de tudo.
