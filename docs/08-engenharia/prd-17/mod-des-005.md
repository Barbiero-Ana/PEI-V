# MOD-DES-005

O painel do professor carrega em até 3 segundos para uma turma de até 40 alunos.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **A medir**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-QUA-03 Como **professor**, quero que o painel carregue rápido e funcione no navegador que eu tiver.

- **HU-QUA-03** CA-01: O painel de uma turma com 40 alunos carrega em até 3 segundos.
- **HU-QUA-03** CA-02: As telas principais funcionam nas duas últimas versões de Chrome, Edge, Firefox e Safari.
- **HU-QUA-03** CA-03: O painel funciona no celular, com o menu em gaveta.

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
