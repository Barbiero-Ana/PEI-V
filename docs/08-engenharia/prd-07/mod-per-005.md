# PRD do requisito MOD-PER-005

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O perfil exibe as constelações de todos os mapas e as estrelas acesas em cada uma.

Origem: [PRD-07 — Perfil e personalização](../../02-modulos/PRD-07%20%E2%80%94%20Perfil%20e%20personaliza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PER-03 Como **aluno**, quero ver todas as minhas constelações no perfil, para lembrar do que conquistei.

- **HU-PER-03** CA-01: O perfil mostra a constelação de cada mapa, com as estrelas acesas.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/(abas)/perfil.tsx](../../../apps/mobile/src/app/(abas)/perfil.tsx)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/web/app/conta/senha](../../../apps/web/app/conta/senha)
- [apps/api/src/acesso.ts](../../../apps/api/src/acesso.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
