# PRD do requisito MOD-REL-001

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Gerar um relatório semanal com missões jogadas, estrelas, dias de luz, constelações e evolução do mascote.

Origem: [PRD-09 — Relatório para a família](../../02-modulos/PRD-09%20%E2%80%94%20Relat%C3%B3rio%20para%20a%20fam%C3%ADlia.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-REL-01 Como **família**, quero receber um resumo da semana do aluno, para acompanhar sem entrar em nenhum sistema.

- **HU-REL-01** CA-01: O relatório mostra os dias jogados na semana, as estrelas, as constelações com as estrelas acesas e o estágio do Lilo.
- **HU-REL-01** CA-02: O texto usa linguagem simples, sem termos técnicos (MOD-USA-001).

Consulte as regras transversais no PRD-17.

## Implementação e evidência

- [apps/mobile/src/app/relatorio.tsx](../../../apps/mobile/src/app/relatorio.tsx)
- [apps/mobile/src/lib/relatorioPdf.ts](../../../apps/mobile/src/lib/relatorioPdf.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
