# PRD do requisito MOD-HIS-004

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

As missões podem ser jogadas sem conexão com a internet, com o progresso salvo no aparelho.

Origem: [PRD-10 — Histórico e sincronização](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-HIS-01 Como **aluno**, quero jogar sem internet, para não depender do Wi-Fi da escola.

- **HU-HIS-01** CA-01: Com o aparelho em modo avião, o aluno abre o app, joga uma missão e o resultado fica salvo.
- **HU-HIS-01** CA-02: Falhas de conexão não fecham o app nem apagam progresso (MOD-CON-001).

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/progresso-local.ts](../../../apps/mobile/src/estado/progresso-local.ts)
- [apps/api/src/sincronizacao-aluno.ts](../../../apps/api/src/sincronizacao-aluno.ts)
- [apps/api/src/progresso-aluno.ts](../../../apps/api/src/progresso-aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
