# PRD do requisito MOD-MAN-008

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Separar homologação e produção, com banco, contas fictícias, segredos, sessão e cache próprios; validar a API HTTPS nos perfis distribuídos e recusar preparação em produção.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-QUA-09 Como **equipe**, quero homologar com dados fictícios sem afetar a produção.

- **HU-QUA-09** CA-01: O pre-deploy prepara a base fictícia duas vezes sem duplicar contas e recusa produção e bases existentes sem a marca.
- **HU-QUA-09** CA-02: APK e painel de teste usam a mesma API HTTPS e o banco isolado; a produção continua disponível.
- **HU-QUA-09** CA-03: O perfil de APK recusa API ausente, local ou HTTP e a prontidão retorna 503 quando o banco está indisponível.
- **HU-QUA-09** CA-04: O mesmo ID de aluno em servidores diferentes mantém sessão, progresso e pendências independentes; a limpeza de credenciais não alcança outro ambiente.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/api/src/infra.ts](../../../apps/api/src/infra.ts)
- [apps/api/prisma/schema.prisma](../../../apps/api/prisma/schema.prisma)
- [apps/api/scripts/verificar-banco.ts](../../../apps/api/scripts/verificar-banco.ts)
- [apps/web/middleware.ts](../../../apps/web/middleware.ts)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/ambiente.ts](../../../apps/mobile/src/estado/ambiente.ts)
- [packages/core](../../../packages/core)

**Aceite nesta auditoria** Evidência parcial.

Pre-deploy ensaiado duas vezes; API isolada validada no percurso integrado. Perfis distribuídos exigem API HTTPS. Testes preservam sessão e filas ao trocar servidores com o mesmo aluno. Aceite do APK e painel acompanhado no roteiro de homologação.
