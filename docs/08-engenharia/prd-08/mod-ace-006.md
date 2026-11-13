# PRD do requisito MOD-ACE-006

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Todos os elementos interativos têm rótulos para leitores de tela.

Origem: [PRD-08 — Acessibilidade](../../02-modulos/PRD-08%20%E2%80%94%20Acessibilidade.md), seção 5. Prioridade **I**, método **N**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ACE-05 Como **aluno que usa leitor de tela**, quero saber o que cada botão faz.

- **HU-ACE-05** CA-01: Com TalkBack ou VoiceOver, todos os botões e áreas de jogo são anunciados com um nome que descreve a ação.
- **HU-ACE-05** CA-02: Estados como certo, errado, bloqueado e concluído são anunciados em texto, não só por cor (MOD-USA-015).

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/acessibilidade.tsx](../../../apps/mobile/src/app/acessibilidade.tsx)
- [apps/mobile/src/estado/acessibilidade.tsx](../../../apps/mobile/src/estado/acessibilidade.tsx)
- [apps/mobile/src/lib/acessibilidadeSalva.ts](../../../apps/mobile/src/lib/acessibilidadeSalva.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
