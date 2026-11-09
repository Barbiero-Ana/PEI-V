# MOD-ADM-005

O administrador deve poder editar os dados cadastrais de um usuário.

Origem: [PRD-02 — Administração de usuários](../../02-modulos/PRD-02%20%E2%80%94%20Administra%C3%A7%C3%A3o%20de%20usu%C3%A1rios.md), seção 5. Prioridade **E**, método **T**. Situação declarada na origem **Implementado**.

[Módulo, fluxo, perfis e entidades](README.md). [Requisitos transversais](../prd-17/README.md).

## Regras, histórias e critérios de aceite

- HU-ADM-03 Como **administrador**, quero corrigir os dados de um usuário, para manter o cadastro certo.

- **HU-ADM-03** CA-01: Dado um usuário, quando o administrador altera e salva, então os novos dados aparecem na lista e na ficha.

As regras de negócio aplicáveis ao contexto estão no [módulo](README.md) e na seção 5 do PRD.

## Implementação e evidência

- [apps/api/src/admin.ts](../../../apps/api/src/admin.ts)
- [apps/web/app/admin/usuarios](../../../apps/web/app/admin/usuarios)
- [apps/web/app/admin/registros](../../../apps/web/app/admin/registros)

**Aceite nesta auditoria** Pendente.

Aceite individual pendente de verificação nesta auditoria. Consulte os cenários e as evidências do módulo.
