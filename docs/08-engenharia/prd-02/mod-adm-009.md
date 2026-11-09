# MOD-ADM-009

O sistema guarda um registro de atividades (quem fez o quê e quando), que o administrador consulta com filtros e que ninguém altera nem apaga.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

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

verificar-banco.ts verifica o papel do banco e rollback da revogação de senha. Demais operações e consulta pela interface precisam de cobertura.
