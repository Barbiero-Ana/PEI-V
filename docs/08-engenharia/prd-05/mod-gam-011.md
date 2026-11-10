# MOD-GAM-011

Não exibir classificação (ranking) entre alunos.

Origem: [PRD-05 — Gamificação](../../02-modulos/PRD-05%20%E2%80%94%20Gamifica%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **N**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-GAM-09 Como **aluno com dificuldade**, quero não ser comparado com os colegas.

- **HU-GAM-09** CA-01: Nenhuma tela do app mostra a posição ou a pontuação de outros alunos.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/constelacoes.ts](../../../packages/core/src/constelacoes.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/mobile/src/app/loja.tsx](../../../apps/mobile/src/app/loja.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
