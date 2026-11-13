# PRD do requisito MOD-IU-003

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A plataforma web tem navegação lateral, listas, formulários e painéis de indicadores.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **N**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-07 Como **professor**, quero achar qualquer seção sem decorar ícones, no computador e no celular.

- **HU-PRF-07** CA-01: No computador, o menu lateral mostra o nome de todas as seções, separadas em "Acompanhar" (Turmas, Alunos, Desempenho, Habilidades e insights) e "Planejar" (Planos de aula, Calendário, Atividades para o app).
- **HU-PRF-07** CA-02: A seção atual fica destacada e é anunciada ao leitor de tela (`aria-current`).
- **HU-PRF-07** CA-03: Cada item do menu tem pelo menos 44 px de altura e ocupa a largura do menu.
- **HU-PRF-07** CA-04: Em telas estreitas, o topo mostra o nome da seção atual e o botão "Menu"; a gaveta fecha com "Fechar", com a tecla Esc, tocando fora ou ao escolher uma seção.
- **HU-PRF-07** CA-05: Há o link "Pular para o conteúdo", visível ao navegar pelo teclado.
- **HU-PRF-07** CA-06: "Sair do painel" fica sempre visível no rodapé do menu (no celular, no topo).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/%28painel%29)
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
