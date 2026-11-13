# PRD do requisito MOD-NOT-004

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Oferecer uma central de notificações, distinguindo lidas e não lidas.

Origem: [PRD-16 — Notificações](../../02-modulos/PRD-16%20%E2%80%94%20Notifica%C3%A7%C3%B5es.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-NOT-03 Como **usuário**, quero ver meus avisos num só lugar, separando o que já li.

- **HU-NOT-03** CA-01: O sino do painel mostra a quantidade de alertas e abre a lista.
- **HU-NOT-03** CA-02: Alertas abertos aparecem como lidos e saem do contador.

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/api/src/avisos-aluno.ts](../../../apps/api/src/avisos-aluno.ts)
- [apps/mobile/src/app/avisos.tsx](../../../apps/mobile/src/app/avisos.tsx)
- [apps/web/lib/painel/alertas.ts](../../../apps/web/lib/painel/alertas.ts)
- [apps/web/components/painel/alertas.tsx](../../../apps/web/components/painel/alertas.tsx)

**Aceite nesta auditoria** Evidência parcial.

Leitura do aluno é guardada no banco, com marcação individual/todos e fila offline. Leitura da equipe continua local ao navegador.
