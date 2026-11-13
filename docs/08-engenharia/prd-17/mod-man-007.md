# PRD do requisito MOD-MAN-007

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Capturar falhas técnicas com versão e contexto mínimo, sem credenciais, conteúdo escolar ou identificação deliberada do aluno; habilitar o envio externo somente com configuração válida.

Origem: [PRD-17 — Qualidade, segurança e restrições](../../02-modulos/PRD-17%20%E2%80%94%20Qualidade%2C%20seguran%C3%A7a%20e%20restri%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-QUA-08 Como **equipe**, quero diagnosticar falhas sem expor dados escolares.

- **HU-QUA-08** CA-01: Um erro controlado na versão instalada aparece no projeto configurado com pilha e versão, sem dados pessoais deliberados.
- **HU-QUA-08** CA-02: Sem DSN o app não inicializa o envio externo; ao habilitar, o build exige as credenciais privadas de mapas de código.
- **HU-QUA-08** CA-03: A API devolve um identificador de falha sem expor mensagens internas e registra apenas rota parametrizada, status e duração.

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

Diagnóstico sanitizado e logs por identificador de requisição testados. Sentry preparado, sem envio até criar/configurar o projeto. Aceite nativo pendente.
