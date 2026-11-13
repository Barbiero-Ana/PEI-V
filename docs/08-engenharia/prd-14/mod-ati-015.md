# PRD do requisito MOD-ATI-015

**Data registrada no PRD de origem:** 2026-11-11. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A exclusão de uma atividade pede confirmação.

Origem: [PRD-14 — Atividades do professor](../../02-modulos/PRD-14%20%E2%80%94%20Atividades%20do%20professor.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ATI-05 Como **professor**, quero corrigir uma atividade ou mudar o prazo depois de enviar.

- **HU-ATI-05** CA-01: Uma atividade enviada pode voltar para rascunho para ser editada.
- **HU-ATI-05** CA-02: Excluir exige abrir "Excluir" e confirmar em "Excluir definitivamente".
- **HU-ATI-05** CA-03: Depois da data limite, a atividade aparece como "Encerrada".

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [packages/core/src/atividades-professor.ts](../../../packages/core/src/atividades-professor.ts)
- [apps/web/app/professor/(painel)/atividades](../../../apps/web/app/professor/%28painel%29/atividades)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/api/src/aluno.ts](../../../apps/api/src/aluno.ts)
- [apps/api/src/publicacoes.ts](../../../apps/api/src/publicacoes.ts)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
