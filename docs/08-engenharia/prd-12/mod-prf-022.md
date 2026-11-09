# MOD-PRF-022

Abrir cartões, gavetas, explicações ou trocar de aba não muda a largura nem a rolagem da página (layout estável).

Origem: [PRD-12 — Painel do professor](../../02-modulos/PRD-12%20%E2%80%94%20Painel%20do%20professor.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-PRF-11 Como **professor**, quero que a tela não se mexa quando abro um cartão ou troco de aba.

- **HU-PRF-11** CA-01: Trocar de aba na ficha da turma não cria nem remove barra de rolagem da página.
- **HU-PRF-11** CA-02: As abas ficam na lateral e o painel tem altura mínima, para a página não "pular" ao trocar de aba.
- **HU-PRF-11** CA-03: O cartão de resumo do aluno abre com o mouse parado 2 s sobre o nome e não empurra a lista.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/web/app/professor/(painel)](../../../apps/web/app/professor/(painel))
- [apps/web/lib/painel/dados.ts](../../../apps/web/lib/painel/dados.ts)
- [packages/core/src/indicadores-smart.ts](../../../packages/core/src/indicadores-smart.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
