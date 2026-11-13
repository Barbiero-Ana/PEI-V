# PRD do requisito MOD-TUR-007

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

Identificar turmas ativas e encerradas.

Origem: [PRD-03 — Gestão de turmas](../../02-modulos/PRD-03%20%E2%80%94%20Gest%C3%A3o%20de%20turmas.md), seção 5. Prioridade **I**, método **D**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-TUR-01 Como **gestão**, quero cadastrar as turmas do ano letivo, para organizar o uso do Modolume.

- **HU-TUR-01** CA-01: Dado o formulário de turma, quando a gestão salva com nome, série, período e ano letivo, então a turma aparece como "Ativa".
- **HU-TUR-01** CA-02: Dada uma turma, quando a gestão a encerra, então ela aparece como "Encerrada" e deixa de aceitar novas entradas pelo código.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/api/src/coordenacao.ts](../../../apps/api/src/coordenacao.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/web/app/admin/turmas](../../../apps/web/app/admin/turmas)
- [apps/web/app/coordenacao/vinculos](../../../apps/web/app/coordenacao/vinculos)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
