# PRD do requisito MOD-ADM-010

**Data registrada no PRD de origem:** 2026-11-10. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

## Objetivo e escopo

A pessoa cadastrada solicita um link privado em Recuperar acesso e define a própria senha. A revogação administrativa exige uma nova recuperação, sem revelar a senha ao administrador.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Parcial**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

O PRD não mapeia uma história individual a este requisito.

Use a descrição da seção 5 como cenário de verificação. O PRD não associa um critério de aceite individual a este item.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Aceite nesta auditoria** Evidência parcial.

verificar-banco.ts cobre cadastro sem credencial na resposta e consumo único do link. A pessoa solicita o link em Recuperar acesso. Entrega real e convite automático no cadastro seguem pendentes.
