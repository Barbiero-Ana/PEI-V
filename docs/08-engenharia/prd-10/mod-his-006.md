# PRD do requisito MOD-HIS-006

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Ao entrar em outro aparelho, o aluno recupera o progresso e preserva as jogadas e os ganhos feitos nos dois aparelhos.

Origem: [PRD-10 — Histórico e sincronização](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-HIS-03 Como **aluno**, quero recuperar meu progresso em outro aparelho.

- **HU-HIS-03** CA-01: Dado um aluno que entra em outro aparelho com o código pessoal e o PIN, então vê as mesmas estrelas, constelações e luzes, preservando também ganhos distintos feitos offline nos dois aparelhos.
- **HU-HIS-03** CA-02: Um aparelho com progresso desatualizado não apaga ganhos de outro: o servidor confirma operações por ID e revisão, e o app reaplica as pendências locais (ADR 0024).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/progresso-local.ts](../../../apps/mobile/src/estado/progresso-local.ts)
- [apps/api/src/sincronizacao-aluno.ts](../../../apps/api/src/sincronizacao-aluno.ts)
- [apps/api/src/progresso-aluno.ts](../../../apps/api/src/progresso-aluno.ts)

**Aceite nesta auditoria** Evidência parcial.

verificar-consolidacao.ts cobre ganhos distintos nas duas ordens, reenvio sem novo crédito, compras concorrentes e importação legada única. Aceite físico pendente.
