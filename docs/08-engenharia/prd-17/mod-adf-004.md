# MOD-ADF-004

Cada mapa contém pelo menos dois formatos de atividade diferentes.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **N**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-QUA-07 Como **professor orientador**, quero que o conteúdo siga a BNCC e cresça em dificuldade.

- **HU-QUA-07** CA-01: Os mapas vão de quantidades e pares (Mapa 1) até funções, probabilidade, média e ordem das operações (Mapa 8).
- **HU-QUA-07** CA-02: Cada missão tem o código da habilidade BNCC revisado.
- **HU-QUA-07** CA-03: Todos os mapas têm pelo menos dois formatos (falta o Mapa 5).

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma)
- [apps/api/scripts/verificar-banco.ts](../../../apps/api/scripts/verificar-banco.ts)
- [apps/web/middleware.ts](../../../apps/web/middleware.ts)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [packages/core](../../../packages/core)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
