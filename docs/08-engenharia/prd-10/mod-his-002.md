# PRD do requisito MOD-HIS-002

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O professor consulta o histórico dos alunos das suas turmas.

Origem: [PRD-10 — Histórico e sincronização](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md), seção 5. Prioridade **E**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-HIS-04 Como **professor**, quero ver o histórico de cada aluno.

- **HU-HIS-04** CA-01: A ficha do aluno no painel mostra os resultados recentes, com atividade, data e acerto.
- **HU-HIS-04** CA-02: O histórico usa as jogadas reais vindas do app.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/progresso-local.ts](../../../apps/mobile/src/estado/progresso-local.ts)
- [apps/api/src/sincronizacao-aluno.ts](../../../apps/api/src/sincronizacao-aluno.ts)
- [apps/api/src/progresso-aluno.ts](../../../apps/api/src/progresso-aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
