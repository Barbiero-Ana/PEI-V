# PRD do requisito MOD-SEG-011

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A escola pode exportar e excluir os dados de um aluno a pedido do responsável.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Pendente**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-QUA-01 Como **escola**, quero que os dados dos alunos sejam protegidos e só acessados por quem tem vínculo, para cumprir a LGPD.

- **HU-QUA-01** CA-01: O app não pede nem guarda e-mail, telefone, endereço ou foto do aluno.
- **HU-QUA-01** CA-02: Nenhuma tela exibe publicidade.
- **HU-QUA-01** CA-03: Senhas e PINs ficam em hash adaptativo (bcrypt) no banco.
- **HU-QUA-01** CA-04: Em produção, todo acesso por HTTP é redirecionado para HTTPS.
- **HU-QUA-01** CA-05: Dado um pedido do responsável, a escola exporta e exclui os dados do aluno.

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
