# PRD do requisito MOD-TUR-008

**Data registrada no PRD de origem:** 2026-11-05. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

~~Gerar para cada turma um código de acesso, que pode ser renovado.~~ Substituído pelo código pessoal do aluno (MOD-AUT-009, ADR 0017).

Origem: [PRD-03 — Gestão de turmas](../../02-modulos/PRD-03%20%E2%80%94%20Gest%C3%A3o%20de%20turmas.md), seção 5. Prioridade **—**, método **—**. Situação declarada na origem **Substituído**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-TUR-04 ~~Como **professor**, quero um código para a turma entrar no app, e poder trocá-lo se vazar.~~ Substituída pela HU-AUT-07.

Use a descrição da seção 5 como cenário de verificação. O PRD não associa um critério de aceite individual a este item.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/api/src/coordenacao.ts](../../../apps/api/src/coordenacao.ts)
- [apps/api/src/professor.ts](../../../apps/api/src/professor.ts)
- [apps/web/app/admin/turmas](../../../apps/web/app/admin/turmas)
- [apps/web/app/coordenacao/vinculos](../../../apps/web/app/coordenacao/vinculos)

**Aceite nesta auditoria** Substituído no PRD.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
