# PRD do requisito MOD-HIS-003

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

O aluno consulta o próprio histórico.

Origem: [PRD-10 — Histórico e sincronização](../../02-modulos/PRD-10%20%E2%80%94%20Hist%C3%B3rico%20e%20sincroniza%C3%A7%C3%A3o.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-HIS-05 Como **aluno**, quero ver as missões que já joguei.

- **HU-HIS-05** CA-01: A aba Níveis mostra as missões concluídas e as estrelas de cada uma.
- **HU-HIS-05** CA-02: O aluno vê a lista das jogadas, com data e resultado.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/mobile/src/estado/conta.tsx](../../../apps/mobile/src/estado/conta.tsx)
- [apps/mobile/src/estado/isolamento.ts](../../../apps/mobile/src/estado/isolamento.ts)
- [apps/mobile/src/estado/progresso-local.ts](../../../apps/mobile/src/estado/progresso-local.ts)
- [apps/api/src/sincronizacao-aluno.ts](../../../apps/api/src/sincronizacao-aluno.ts)
- [apps/api/src/progresso-aluno.ts](../../../apps/api/src/progresso-aluno.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
