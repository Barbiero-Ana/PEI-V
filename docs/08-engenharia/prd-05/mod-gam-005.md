# PRD do requisito MOD-GAM-005

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Sortear diariamente um desafio do dia, conforme a RN-11.

Origem: [PRD-05 — Gamificação](../../02-modulos/PRD-05%20%E2%80%94%20Gamifica%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-GAM-03 Como **aluno**, quero um desafio especial por dia, para ter motivo de voltar.

- **HU-GAM-03** CA-01: Dados dois alunos no mesmo dia, então os dois veem o mesmo desafio.
- **HU-GAM-03** CA-02: A primeira conclusão recebe o bônus diário. Uma tentativa melhor ajusta apenas a diferença desse único bônus, sem multiplicá-lo por aparelho (RN-11; ADR 0024).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/constelacoes.ts](../../../packages/core/src/constelacoes.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/mobile/src/app/loja.tsx](../../../apps/mobile/src/app/loja.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
