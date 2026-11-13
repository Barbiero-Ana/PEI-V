# PRD do requisito MOD-GAM-002

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Atribuir pontos de luz a cada missão concluída, conforme a RN-02.

Origem: [PRD-05 — Gamificação](../../02-modulos/PRD-05%20%E2%80%94%20Gamifica%C3%A7%C3%A3o.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-GAM-01 Como **aluno**, quero ver as estrelas da constelação acendendo, para sentir que estou avançando.

- **HU-GAM-01** CA-01: Dada uma missão de 5 fases com 4 acertos de primeira, quando concluída, então o aluno ganha 12 pontos de luz (RN-02).
- **HU-GAM-01** CA-02: Dado um mapa com 10 pontos de luz acumulados, então 2 estrelas estão acesas (RN-03).
- **HU-GAM-01** CA-03: Dado um mapa com pontos suficientes, mas com uma missão não concluída, então a última estrela continua apagada (RN-04).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/constelacoes.ts](../../../packages/core/src/constelacoes.ts)
- [apps/mobile/src/estado/jogador.tsx](../../../apps/mobile/src/estado/jogador.tsx)
- [apps/mobile/src/app/loja.tsx](../../../apps/mobile/src/app/loja.tsx)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
