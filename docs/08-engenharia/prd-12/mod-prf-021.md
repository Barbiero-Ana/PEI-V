# PRD do requisito MOD-PRF-021

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Com mais de 4 turmas e sem filtro, o gráfico de evolução e os resultados por formato mostram a média das turmas, em vez de uma linha por turma.

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-09 Como **professor com muitas turmas**, quero escolher a turma numa lista com busca, igual em todas as páginas, para filtrar resultados sem a tela virar uma bagunça.

- **HU-PRF-09** CA-01: Em todas as páginas com turma, o filtro é um seletor "Turma" com a turma escolhida, sua cor e a contagem.
- **HU-PRF-09** CA-02: Dada uma lista com mais de 6 opções, o seletor mostra o campo "Buscar turma", que filtra sem diferenciar acentos.
- **HU-PRF-09** CA-03: O seletor abre com Enter ou seta para baixo, navega com as setas, escolhe com Enter e fecha com Esc ou clicando fora.
- **HU-PRF-09** CA-04: Em Alunos, turma, situação ("Todos" ou "Pedem atenção") e ordem são filtros separados, cada um com a sua contagem, e o resultado diz "N de M alunos" com "Limpar filtros".
- **HU-PRF-09** CA-05: Em Alunos, a lista mostra 20 alunos por página, com "Anterior" e "Próxima"; mudar um filtro volta para a página 1.
- **HU-PRF-09** CA-06: Com mais de 4 turmas e "Todas as turmas", o gráfico de Desempenho mostra a média das turmas.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
